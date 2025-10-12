import zipfile
import os

def create_sbes_test_zip():
    """Cria um ZIP com PDFs usando os nomes exatos das entradas BibTeX"""
    zip_filename = 'sbes_test_pdfs.zip'
    
    # Criar arquivos de teste simulando PDFs com os nomes exatos das entradas BibTeX
    test_files = {
        'sbes-paper1.pdf': b'%PDF-1.4 Test PDF content for Robotic-supported Data Loss Detection in Android Applications',
        'sbes-paper2.pdf': b'%PDF-1.4 Test PDF content for Code smell severity classification',
        'sbes-paper3.pdf': b'%PDF-1.4 Test PDF content for Effective Collaboration between Software Engineers and Data Scientists',
        'sbes-paper4.pdf': b'%PDF-1.4 Test PDF content for Investigating Accountability in Business-intensive Systems-of-Systems'
    }
    
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for filename, content in test_files.items():
            zipf.writestr(filename, content)
            print(f"Added to ZIP: {filename}")
    
    print(f"\n✅ Created {zip_filename} with SBES test PDFs!")
    return zip_filename

if __name__ == "__main__":
    create_sbes_test_zip()