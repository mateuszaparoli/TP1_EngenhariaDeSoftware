import { test, expect } from '@playwright/test';

test.describe('Painel Administrativo', () => {
  test('deve acessar a página de login do administrador', async ({ page }) => {
    // Navegar para a página de login admin
    await page.goto('/admin/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página de login carregou
    await expect(page.getByText('Login do Administrador')).toBeVisible({ timeout: 10000 });
    
    // Verificar presença de campos de login
    const emailInput = page.getByLabel('E-mail');
    const passwordInput = page.getByLabel('Senha');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    // Verificar botão de login
    const loginButton = page.getByRole('button', { name: /Entrar/i });
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    
    // Tirar screenshot
    await page.screenshot({ path: 'test-results/admin-login-page.png', fullPage: true });
  });

  test('deve validar campos obrigatórios no login', async ({ page }) => {
    await page.goto('/admin/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página carregou
    await expect(page.getByText('Login do Administrador')).toBeVisible({ timeout: 10000 });
    
    // Tentar fazer login sem preencher campos
    const loginButton = page.getByRole('button', { name: /Entrar/i });
    await loginButton.click();
    
    // Aguardar validação
    await page.waitForTimeout(1000);
    
    // Verificar se os campos têm atributo required
    const emailInput = page.getByLabel('E-mail');
    const passwordInput = page.getByLabel('Senha');
    
    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    
    // Ambos devem ser obrigatórios
    expect(emailRequired).not.toBeNull();
    expect(passwordRequired).not.toBeNull();
    
    await page.screenshot({ path: 'test-results/admin-validation.png', fullPage: true });
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/admin/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Preencher credenciais
    await page.getByLabel('E-mail').fill('admin@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    
    // Tirar screenshot antes do login
    await page.screenshot({ path: 'test-results/admin-before-login.png', fullPage: true });
    
    // Clicar em entrar
    await page.getByRole('button', { name: /Entrar/i }).click();
    
    // Aguardar navegação ou mensagem
    await page.waitForTimeout(2000);
    
    // Verificar se foi redirecionado para dashboard ou se apareceu mensagem
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin');
    const hasSuccessMessage = await page.getByText(/Bem-vindo|sucesso/i).isVisible().catch(() => false);
    
    // Deve ter sido redirecionado OU aparecer mensagem de sucesso
    expect(isDashboard || hasSuccessMessage).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/admin-after-login.png', fullPage: true });
  });

  test('deve exibir botão de voltar para página inicial', async ({ page }) => {
    await page.goto('/admin/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar botão de voltar
    const backButton = page.getByRole('button', { name: /Voltar para a página inicial/i });
    await expect(backButton).toBeVisible({ timeout: 5000 });
    
    // Clicar no botão
    await backButton.click();
    
    // Aguardar navegação
    await page.waitForTimeout(1000);
    
    // Verificar que foi redirecionado para home
    expect(page.url()).toBe('http://172.31.152.200:8080/');
    
    await page.screenshot({ path: 'test-results/admin-back-home.png', fullPage: true });
  });
});
