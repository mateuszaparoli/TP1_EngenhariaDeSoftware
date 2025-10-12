import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Check, X, AlertCircle } from "lucide-react";
import { getEvents, getEditions, bulkImportArticles, EventItem, EditionItem, BulkImportPayload, BulkImportResponse } from "@/lib/api";
import { toast } from "sonner";

export default function BulkImportManager(): React.JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    edition_id: undefined as number | undefined,
    bibtex_content: "",
  });
  const [bibtexFile, setBibtexFile] = useState<File | null>(null);
  const [pdfZipFile, setPdfZipFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, editionsData] = await Promise.all([getEvents(), getEditions()]);
      setEvents(eventsData);
      setEditions(editionsData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  // Filter editions by selected event
  const filteredEditions = selectedEventId 
    ? editions.filter(edition => edition.event?.id === selectedEventId)
    : [];

  function handleBibtexFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setBibtexFile(e.target.files[0]);
      // Clear text content when file is selected
      setForm({ ...form, bibtex_content: "" });
    }
  }

  function handlePdfZipFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setPdfZipFile(e.target.files[0]);
    }
  }

  function handleTextChange(value: string) {
    setForm({ ...form, bibtex_content: value });
    // Clear file when text is entered
    if (value.trim()) {
      setBibtexFile(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setImportResult(null);

    // Validate that an existing edition is selected
    if (!form.edition_id) {
      setError("Selecione uma edição existente");
      toast.error("Selecione uma edição existente");
      return;
    }

    const selectedEdition = editions.find(ed => ed.id === form.edition_id);
    if (!selectedEdition) {
      setError("Edição selecionada não encontrada");
      toast.error("Edição selecionada não encontrada");
      return;
    }

    if (!bibtexFile && !form.bibtex_content?.trim()) {
      setError("Forneça um arquivo BibTeX ou cole o conteúdo");
      toast.error("Forneça um arquivo BibTeX ou cole o conteúdo");
      return;
    }

    setImporting(true);
    try {
      // Use existing edition - send edition_id instead of event_name + year
      const payload: BulkImportPayload = {
        edition_id: form.edition_id,
        bibtex_content: form.bibtex_content,
      };

      const result = await bulkImportArticles(payload, bibtexFile || undefined, pdfZipFile || undefined);
      setImportResult(result);
      
      if (result.success) {
        const pdfMessage = result.pdf_matches > 0 ? ` (${result.pdf_matches} com PDFs)` : "";
        const skipMessage = result.skipped_count > 0 ? `, ${result.skipped_count} pulados` : "";
        toast.success(`${result.created_count} artigos importados com sucesso!${pdfMessage}${skipMessage}`);
        // Reset form
        setForm({
          edition_id: undefined,
          bibtex_content: "",
        });
        setSelectedEventId(undefined);
        setBibtexFile(null);
        setPdfZipFile(null);
      }
    } catch (err: any) {
      setError(err.message || "Erro na importação");
      toast.error(err.message || "Erro na importação");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Importação em Massa (BibTeX)</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importar Artigos via BibTeX</CardTitle>
          <CardDescription>
            Importe múltiplos artigos de uma só vez usando um arquivo BibTeX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="event_select">Selecionar Evento</Label>
              <Select
                value={selectedEventId?.toString() || ""}
                onValueChange={(value) => {
                  const eventId = value ? parseInt(value) : undefined;
                  setSelectedEventId(eventId);
                  setForm({ ...form, edition_id: undefined });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento existente" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id!.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edition_select">Edição</Label>
              <Select
                value={form.edition_id?.toString() || ""}
                onValueChange={(value) => {
                  const editionId = value ? parseInt(value) : undefined;
                  setForm({ ...form, edition_id: editionId });
                }}
                disabled={!selectedEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedEventId ? "Selecione uma edição" : "Selecione um evento primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredEditions.length === 0 && selectedEventId ? (
                    <SelectItem value="" disabled>
                      Nenhuma edição encontrada para este evento
                    </SelectItem>
                  ) : (
                    filteredEditions.map((edition) => (
                      <SelectItem key={edition.id} value={edition.id!.toString()}>
                        {edition.year} {edition.location && `- ${edition.location}`}
                        {edition.start_date && ` (${new Date(edition.start_date).toLocaleDateString('pt-BR')})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedEventId && filteredEditions.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1 text-orange-600">
                  Nenhuma edição encontrada. Crie uma edição primeiro na aba "Edições".
                </p>
              )}
            </div>

            <div>
              <Label>Conteúdo BibTeX</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bibtex_file">Upload de arquivo .bib</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bibtex_file"
                      type="file"
                      accept=".bib,.txt"
                      onChange={handleBibtexFileChange}
                      className="flex-1"
                    />
                    {bibtexFile && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {bibtexFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center text-muted-foreground">OU</div>

                <div>
                  <Label htmlFor="bibtex_content">Cole o conteúdo BibTeX (opcional)</Label>
                  <Textarea
                    id="bibtex_content"
                    placeholder="@article{example2023,
  title={Título do Artigo},
  author={João Silva and Maria Santos},
  journal={Nome da Conferência},
  year={2023},
  abstract={Resumo do artigo...},
  url={https://exemplo.com/artigo.pdf}
}

@article{outro2023,
  title={Outro Artigo},
  author={Pedro Oliveira},
  ...
}"
                    rows={10}
                    value={form.bibtex_content}
                    onChange={(e) => handleTextChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pdf_zip">Arquivo ZIP com PDFs</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf_zip"
                  type="file"
                  accept=".zip"
                  onChange={handlePdfZipFileChange}
                  className="flex-1"
                />
                {pdfZipFile && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {pdfZipFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faça upload de um arquivo ZIP contendo os PDFs dos artigos. O sistema tentará associar automaticamente cada PDF ao artigo correspondente baseado no título.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={importing || !form.edition_id} className="flex items-center gap-2">
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar Artigos
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              Relatório da Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-sm text-green-700 font-medium">
                  Importados
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {importResult.created_count}
                </div>
              </div>
              
              {importResult.skipped_count > 0 && (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <div className="text-sm text-yellow-700 font-medium">
                    Pulados
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.skipped_count}
                  </div>
                </div>
              )}

              {importResult.error_count > 0 && (
                <div className="bg-red-50 p-3 rounded-md">
                  <div className="text-sm text-red-700 font-medium">
                    Erros
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.error_count}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-700 font-medium">
                  Taxa de Sucesso
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.report.summary.success_rate}%
                </div>
              </div>
            </div>

            {/* Detailed Report */}
            {importResult.report && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Resumo Detalhado:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Total de entradas processadas: {importResult.report.summary.total_entries_processed}</div>
                  <div>• Importações bem-sucedidas: {importResult.report.summary.successful_imports}</div>
                  <div>• Entradas puladas: {importResult.report.summary.skipped_entries}</div>
                  <div>• Erros de processamento: {importResult.report.summary.processing_errors}</div>
                  {importResult.report.summary.pdf_files_in_zip > 0 && (
                    <>
                      <div>• PDFs no arquivo ZIP: {importResult.report.summary.pdf_files_in_zip}</div>
                      <div>• PDFs associados com sucesso: {importResult.report.summary.pdfs_successfully_matched}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Skipped Articles Details */}
            {importResult.skipped_articles && importResult.skipped_articles.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Artigos Pulados ({importResult.skipped_articles.length}):
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.skipped_articles.map((skipped, index) => (
                    <div key={index} className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                      <div className="font-medium text-yellow-800">{skipped.title}</div>
                      <div className="text-yellow-700 mt-1">
                        <strong>Motivo:</strong> {skipped.reason}
                      </div>
                      {skipped.missing_fields && skipped.missing_fields.length > 0 && (
                        <div className="text-yellow-600 mt-1 text-xs">
                          Campos em falta: {skipped.missing_fields.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Errors */}
            {importResult.processing_errors && importResult.processing_errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Erros de Processamento:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.processing_errors.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                      <div className="font-medium text-red-800">{error.title}</div>
                      <div className="text-red-700">{error.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Successfully Imported Articles */}
            {importResult.articles.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">
                  Artigos Importados com Sucesso ({importResult.articles.length}):
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.articles.map((article) => (
                    <div key={article.id} className="text-sm bg-green-50 p-2 rounded">
                      <div className="font-medium">{article.title}</div>
                      {article.authors && article.authors.length > 0 && (
                        <div className="text-green-600">
                          Autores: {article.authors.map(a => a.name).join(", ")}
                        </div>
                      )}
                      {article.pdf_url && article.pdf_url.includes('localhost:8000') && (
                        <div className="text-blue-600 text-xs">
                          📎 PDF anexado automaticamente
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Common Skip Reasons */}
            {importResult.report.details.most_common_skip_reasons.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Principais Motivos de Pulos:</h4>
                <div className="space-y-1">
                  {importResult.report.details.most_common_skip_reasons.map(([reason, count], index) => (
                    <div key={index} className="text-sm bg-gray-100 p-2 rounded flex justify-between">
                      <span>{reason}</span>
                      <span className="font-medium">{count} vez(es)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}