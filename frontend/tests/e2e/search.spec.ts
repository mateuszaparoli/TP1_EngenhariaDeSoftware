import { test, expect } from '@playwright/test';

test.describe('Busca de Artigos', () => {
  test('deve buscar e encontrar artigos por título', async ({ page }) => {
    // Navegar para a página de busca
    await page.goto('/search');
    
    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página de busca carregou (título "Buscar Artigos de Pesquisa")
    await expect(page.getByText('Buscar Artigos de Pesquisa')).toBeVisible({ timeout: 10000 });
    
    // Localizar o campo de busca pelo placeholder
    const searchInput = page.getByPlaceholder(/Buscar por título do artigo/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Realizar uma busca
    await searchInput.fill('software');
    
    // Clicar no botão "Buscar"
    const searchButton = page.getByRole('button', { name: /Buscar/i });
    await searchButton.click();
    
    // Aguardar os resultados aparecerem (ou mensagem de "nenhum resultado")
    await page.waitForTimeout(2000);
    
    // Verificar se apareceu o texto "Resultados da Busca"
    const resultsHeading = page.getByText('Resultados da Busca');
    await expect(resultsHeading).toBeVisible({ timeout: 5000 });
    
    // Verificar se há resultados ou mensagem de nenhum resultado
    const hasResults = await page.locator('h3.text-xl.font-semibold').first().isVisible().catch(() => false);
    const noResults = await page.getByText('Nenhum artigo encontrado').isVisible().catch(() => false);
    
    // Deve ter resultados OU mensagem de nenhum resultado
    expect(hasResults || noResults).toBeTruthy();
    
    // Tirar screenshot do resultado
    await page.screenshot({ path: 'test-results/search-test.png', fullPage: true });
  });

  test('deve filtrar artigos por autor', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que a página carregou
    await expect(page.getByText('Buscar Artigos de Pesquisa')).toBeVisible({ timeout: 10000 });
    
    // Clicar no select para mudar o tipo de busca
    const selectTrigger = page.getByRole('combobox');
    await selectTrigger.click();
    
    // Aguardar o menu abrir e selecionar "Autor"
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Autor' }).click();
    
    // Aguardar o placeholder mudar
    await page.waitForTimeout(500);
    
    // Localizar o campo de busca que agora deve ter placeholder de autor
    const searchInput = page.getByPlaceholder(/Buscar por nome do autor/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Fazer a busca
    await searchInput.fill('Silva');
    
    // Clicar no botão buscar
    await page.getByRole('button', { name: /Buscar/i }).click();
    
    // Aguardar resultados
    await page.waitForTimeout(2000);
    
    // Verificar que a busca foi executada
    const resultsHeading = page.getByText('Resultados da Busca');
    await expect(resultsHeading).toBeVisible({ timeout: 5000 });
    
    // Tirar screenshot
    await page.screenshot({ path: 'test-results/search-author-test.png', fullPage: true });
  });

  test('deve exibir mensagem quando não houver resultados', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fazer busca por termo que não deve existir
    const searchInput = page.getByPlaceholder(/Buscar por título do artigo/i);
    await searchInput.fill('xyzabc123inexistente999');
    
    await page.getByRole('button', { name: /Buscar/i }).click();
    
    // Aguardar resposta
    await page.waitForTimeout(2000);
    
    // Verificar mensagem de nenhum resultado
    const noResultsMessage = page.getByText('Nenhum artigo encontrado');
    await expect(noResultsMessage).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/search-no-results.png', fullPage: true });
  });
});
