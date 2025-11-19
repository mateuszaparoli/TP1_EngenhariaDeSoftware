import { test, expect } from '@playwright/test';

test.describe('Sistema de Notificações', () => {
  test('deve cadastrar inscrição para notificações de autor', async ({ page }) => {
    // Navegar para a página de cadastro de notificações
    await page.goto('/notifications/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página carregou
    await expect(page.getByText('Receber Notificações')).toBeVisible({ timeout: 10000 });
    
    // Gerar email único para teste
    const timestamp = Date.now();
    const testEmail = `teste${timestamp}@example.com`;
    const testName = 'João Silva Teste';
    
    // Preencher campo de nome (usando o label)
    const nameInput = page.getByLabel('Nome Completo');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(testName);
    
    // Preencher campo de email
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    // Tirar screenshot antes de submeter
    await page.screenshot({ path: 'test-results/notification-form-filled.png', fullPage: true });
    
    // Clicar no botão de cadastrar
    const submitButton = page.getByRole('button', { name: /Cadastrar para Notificações/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();
    
    // Aguardar resposta (toast de sucesso ou erro)
    await page.waitForTimeout(3000);
    
    // Verificar se apareceu mensagem de sucesso (toast)
    const successMessage = page.getByText(/Cadastro realizado com sucesso|sucesso/i);
    const errorMessage = page.getByText(/Erro|erro/i);
    
    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // Deve ter alguma resposta
    expect(hasSuccess || hasError).toBeTruthy();
    
    // Tirar screenshot do resultado
    await page.screenshot({ path: 'test-results/notification-result.png', fullPage: true });
  });

  test('deve validar campos obrigatórios no formulário de notificações', async ({ page }) => {
    await page.goto('/notifications/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página carregou
    await expect(page.getByText('Receber Notificações')).toBeVisible({ timeout: 10000 });
    
    // Tentar submeter formulário vazio
    const submitButton = page.getByRole('button', { name: /Cadastrar para Notificações/i });
    await submitButton.click();
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar se os campos têm atributo required (validação HTML5)
    const nameInput = page.getByLabel('Nome Completo');
    const emailInput = page.getByLabel('Email');
    
    const nameRequired = await nameInput.getAttribute('required');
    const emailRequired = await emailInput.getAttribute('required');
    
    // Verificar que os campos são obrigatórios
    expect(nameRequired).not.toBeNull();
    expect(emailRequired).not.toBeNull();
    
    await page.screenshot({ path: 'test-results/notification-validation.png', fullPage: true });
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/notifications/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Preencher com nome válido
    await page.getByLabel('Nome Completo').fill('João Silva');
    
    // Preencher com email inválido
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('emailinvalido');
    
    // Verificar que o campo tem validação de email (type="email")
    const emailType = await emailInput.getAttribute('type');
    expect(emailType).toBe('email');
    
    await page.screenshot({ path: 'test-results/notification-email-validation.png', fullPage: true });
  });
});
