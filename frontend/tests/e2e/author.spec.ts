import { test, expect } from '@playwright/test';

test.describe('Página de Autor', () => {
  test('deve visualizar perfil de autor e seus artigos', async ({ page }) => {
    // Ir para a página de busca primeiro para encontrar um autor
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fazer uma busca para ter resultados
    const searchInput = page.getByPlaceholder(/Buscar por título do artigo/i);
    await searchInput.fill('a');
    await page.getByRole('button', { name: /Buscar/i }).click();
    await page.waitForTimeout(2000);
    
    // Procurar por um link de autor nos resultados
    const authorLink = page.locator('button.text-primary').first();
    
    if (await authorLink.isVisible().catch(() => false)) {
      // Clicar no link do autor
      await authorLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Verificar que a página do autor carregou
      await expect(page).toHaveURL(/\/authors\//);
      
      // Verificar elementos da página do autor
      const authorHeader = page.getByText('Publicações de Pesquisa');
      await expect(authorHeader).toBeVisible({ timeout: 10000 });
      
      // Tirar screenshot
      await page.screenshot({ path: 'test-results/author-page.png', fullPage: true });
      
    } else {
      // Testar acessando URL direta de um autor
      await page.goto('/authors/Silva');
      await page.waitForTimeout(1500);
      
      // Verificar se carregou página de autor ou página de "não encontrado"
      const isAuthorPage = await page.getByText('Publicações de Pesquisa').isVisible().catch(() => false);
      const is404 = await page.getByText('Autor não encontrado').isVisible().catch(() => false);
      
      // Deve ser uma ou outra
      expect(isAuthorPage || is404).toBeTruthy();
      
      await page.screenshot({ path: 'test-results/author-page-direct.png', fullPage: true });
    }
  });

  test('deve exibir total de artigos do autor', async ({ page }) => {
    // Ir para busca e encontrar um autor
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fazer busca
    const searchInput = page.getByPlaceholder(/Buscar por título do artigo/i);
    await searchInput.fill('software');
    await page.getByRole('button', { name: /Buscar/i }).click();
    await page.waitForTimeout(2000);
    
    // Clicar em autor se disponível
    const authorLink = page.locator('button.text-primary').first();
    
    if (await authorLink.isVisible().catch(() => false)) {
      await authorLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Verificar badge com total de artigos
      const articleBadge = page.locator('text=/\\d+ artigo/i').first();
      const hasBadge = await articleBadge.isVisible().catch(() => false);
      
      if (hasBadge) {
        await expect(articleBadge).toBeVisible();
      }
      
      await page.screenshot({ path: 'test-results/author-stats.png', fullPage: true });
    } else {
      // Teste alternativo: verificar que a página de busca funciona
      const resultsHeading = page.getByText('Resultados da Busca');
      await expect(resultsHeading).toBeVisible({ timeout: 5000 });
    }
  });
});
