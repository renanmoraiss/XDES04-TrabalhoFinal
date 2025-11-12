from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import pytest


# === CONFIGURAÇÃO GLOBAL ===
BASE_URL = "http://127.0.0.1:5500/frontend/index.html"
DELAY = 1.0  # tempo entre ações — ajuste para controlar a velocidade (1.0 = natural, 1.5 = mais devagar, 0.5 = rápido)


def slow():
    """Pausa global entre ações (modo apresentação)."""
    time.sleep(DELAY)


def human_type(element, text, delay=0.08):
    """Simula digitação humana caractere por caractere."""
    for char in text:
        element.send_keys(char)
        time.sleep(delay)


@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # opcional: descomente se quiser logs reduzidos
    # options.add_experimental_option("excludeSwitches", ["enable-logging"])
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    yield driver
    driver.quit()


def test_crud_aluno(driver):
    wait = WebDriverWait(driver, 10)

    # === 1. Acessa o sistema ===
    driver.get(BASE_URL)
    wait.until(EC.presence_of_element_located((By.ID, "stat-total-alunos")))
    slow()

    # === 2. Vai para "Cadastro de Aluno" ===
    cadastrar_home = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href,'#/aluno/cadastro') and contains(@class,'btn')]")
    ))
    cadastrar_home.click()
    slow()

    # === 3. Preenche o formulário de cadastro ===
    wait.until(EC.presence_of_element_located((By.ID, "form-cadastro")))

    human_type(driver.find_element(By.ID, "nome"), "João Teste Selenium")
    slow()
    human_type(driver.find_element(By.ID, "matricula"), "9998")
    slow()
    human_type(driver.find_element(By.ID, "email"), "joao.teste@atlas.com.br")
    slow()
    human_type(driver.find_element(By.ID, "telefone"), "11988887777")
    slow()
    driver.find_element(By.ID, "dataNascimento").send_keys("2000-01-15")
    slow()

    # Submete o formulário
    driver.find_element(By.CSS_SELECTOR, "#form-cadastro button[type='submit']").click()
    slow()

    # === 4. Espera pela mensagem de sucesso ===
    msg_el = wait.until(EC.visibility_of_element_located((By.ID, "cadastro-messages")))
    msg_text = msg_el.text.lower()
    assert ("sucesso" in msg_text) or ("cadastrado" in msg_text), f"Mensagem inesperada: {msg_text}"
    slow()

    # === 5. Volta para a home e vai para "Consulta de Alunos" ===
    driver.get(BASE_URL)
    wait.until(EC.presence_of_element_located((By.ID, "stat-total-alunos")))
    slow()

    consulta_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href,'#/aluno/consulta') and contains(@class,'btn')]")
    ))
    consulta_btn.click()
    slow()

    # === 6. Verifica se o aluno criado aparece na tabela ===
    tbody = wait.until(EC.presence_of_element_located((By.ID, "tbody-alunos")))
    tabela_text = driver.find_element(By.ID, "tabela-alunos").text
    assert "João Teste Selenium" in tabela_text or "9998" in tabela_text
    slow()

    # === 7. Editar o aluno ===
    editar_btn_xpath = (
        "//tbody[@id='tbody-alunos']//tr[td[contains(.,'João Teste Selenium') or td[contains(.,'9998')]]]"
        "//button[contains(.,'Editar')]"
    )

    try:
        btn_editar = wait.until(EC.element_to_be_clickable((By.XPATH, editar_btn_xpath)))
        btn_editar.click()
        slow()

        wait.until(EC.visibility_of_element_located((By.ID, "edit-nome")))
        nome_edit = driver.find_element(By.ID, "edit-nome")
        nome_edit.clear()
        human_type(nome_edit, "João Atualizado Selenium")
        slow()

        driver.find_element(By.CSS_SELECTOR, "#form-edicao button[type='submit']").click()
        wait.until(EC.invisibility_of_element_located((By.ID, "modal-overlay")))
        slow()

        tabela_text = driver.find_element(By.ID, "tabela-alunos").text
        assert "João Atualizado Selenium" in tabela_text
        slow()

    except Exception as e:
        raise AssertionError("❌ Falha ao tentar editar — botão não encontrado ou modal não abriu") from e

    # === 8. Excluir o aluno ===
    excluir_btn_xpath = (
        "//tbody[@id='tbody-alunos']//tr[td[contains(.,'João Atualizado Selenium') or td[contains(.,'9998')]]]"
        "//button[contains(.,'Excluir')]"
    )
    excluir_btn_fallback = "//tbody[@id='tbody-alunos']//button[contains(.,'Excluir')]"

    try:
        try:
            btn_excluir = driver.find_element(By.XPATH, excluir_btn_xpath)
        except Exception:
            btn_excluir = driver.find_element(By.XPATH, excluir_btn_fallback)

        btn_excluir.click()
        slow()

        wait.until(EC.alert_is_present())
        alert = driver.switch_to.alert
        alert.accept()
        slow()

        tabela_final = driver.find_element(By.ID, "tabela-alunos").text
        assert "João Atualizado Selenium" not in tabela_final
        slow()

        print("\n✅ CRUD de Aluno executado com sucesso (modo apresentação).")

    except Exception:
        raise AssertionError("❌ Falha ao excluir — botão ou alerta não encontrado.")
