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
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    yield driver
    driver.quit()


def test_crud_autor(driver):
    wait = WebDriverWait(driver, 10)

    # === 1. Acessa o sistema ===
    driver.get(BASE_URL)
    wait.until(EC.presence_of_element_located((By.ID, "stat-total-autores")))
    slow()

    # === 2. Vai para "Cadastro de Autor" ===
    cadastrar_autor_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href,'#/autor/cadastro') and contains(@class,'btn')]")
    ))
    cadastrar_autor_btn.click()
    slow()

    # === 3. Preenche o formulário de cadastro de autor ===
    wait.until(EC.presence_of_element_located((By.ID, "form-autor-cadastro")))

    human_type(driver.find_element(By.ID, "autorNome"), "Machado de Selenium")
    slow()
    human_type(driver.find_element(By.ID, "autorNacionalidade"), "Brasileira")
    slow()
    driver.find_element(By.ID, "autorNascimento").send_keys("1839-06-21")
    slow()
    human_type(driver.find_element(By.ID, "autorBiografia"), "Autor de testes automatizados e literatura técnica.")
    slow()

    # Submete o formulário
    driver.find_element(By.CSS_SELECTOR, "#form-autor-cadastro button[type='submit']").click()
    slow()

    # === 4. Espera mensagem de sucesso ===
    msg_el = wait.until(EC.visibility_of_element_located((By.ID, "autor-cadastro-messages")))
    msg_text = msg_el.text.lower()
    assert ("sucesso" in msg_text) or ("cadastrado" in msg_text), f"Mensagem inesperada: {msg_text}"
    slow()

    # === 5. Volta pra home e vai pra "Consulta de Autores" ===
    driver.get(BASE_URL)
    wait.until(EC.presence_of_element_located((By.ID, "stat-total-autores")))
    slow()

    consulta_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href,'#/autor/consulta') and contains(@class,'btn')]")
    ))
    consulta_btn.click()
    slow()

    # === 6. Verifica se o autor aparece na tabela ===
    wait.until(EC.presence_of_element_located((By.ID, "tbody-autores")))
    tabela_text = driver.find_element(By.ID, "tabela-autores").text
    assert "Machado de Selenium" in tabela_text
    slow()

    # === 7. Editar o autor ===
    editar_btn_xpath = (
        "//tbody[@id='tbody-autores']//tr[td[contains(.,'Machado de Selenium')]]"
        "//button[contains(.,'Editar')]"
    )

    try:
        btn_editar = wait.until(EC.element_to_be_clickable((By.XPATH, editar_btn_xpath)))
        btn_editar.click()
        slow()

        wait.until(EC.visibility_of_element_located((By.ID, "edit-autor-nome")))
        nome_edit = driver.find_element(By.ID, "edit-autor-nome")
        nome_edit.clear()
        human_type(nome_edit, "Machado de Selenium Atualizado")
        slow()

        driver.find_element(By.CSS_SELECTOR, "#form-autor-edicao button[type='submit']").click()
        wait.until(EC.invisibility_of_element_located((By.ID, "modal-autor-overlay")))
        slow()

        tabela_text = driver.find_element(By.ID, "tabela-autores").text
        assert "Machado de Selenium Atualizado" in tabela_text
        slow()

    except Exception as e:
        raise AssertionError("❌ Falha ao tentar editar — botão não encontrado ou modal não abriu") from e

    # === 8. Excluir o autor ===
    excluir_btn_xpath = (
        "//tbody[@id='tbody-autores']//tr[td[contains(.,'Machado de Selenium Atualizado')]]"
        "//button[contains(.,'Excluir')]"
    )
    excluir_btn_fallback = "//tbody[@id='tbody-autores']//button[contains(.,'Excluir')]"

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

        tabela_final = driver.find_element(By.ID, "tabela-autores").text
        assert "Machado de Selenium Atualizado" not in tabela_final
        slow()

        print("\n✅ CRUD de Autor executado com sucesso (modo apresentação).")

    except Exception:
        raise AssertionError("❌ Falha ao excluir — botão ou alerta não encontrado.")
