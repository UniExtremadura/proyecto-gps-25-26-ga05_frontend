// Vista: renderiza una noticia completa
import EventEmitter from '../core/EventEmitter.js'

export default class NoticiaView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('noticia-view')
  }

  render(state) {
    if (state.loading) {
      this._renderLoading()
      return
    }

    if (state.error) {
      this._renderError(state.error)
      return
    }

    this._renderNoticia(state.noticia)
  }

  _renderLoading() {
    this.root.innerHTML = `
      <div class="container py-5">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando noticia...</span>
          </div>
          <p class="text-muted mt-2">Cargando noticia...</p>
        </div>
      </div>
    `
  }

  _renderError(error) {
    this.root.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${error}
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
        </div>
      </div>
    `

    this.root.querySelector('#retry-btn').addEventListener('click', () => {
      this.emit('retry')
    })
  }

  _renderNoticia(noticia) {
    if (!noticia) {
      this._renderError('Noticia no encontrada')
      return
    }

    const isAdmin = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('authUser') || 'null')
        return u && u.tipo === 1
      } catch { return false }
    })()

    this.root.innerHTML = `
      <div class="container py-4">
        <!-- Cabecera de la noticia -->
        <article class="news-article" id="printable-content">
          <header class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <small class="text-muted">
                <i class="bi bi-calendar-event me-1"></i>
                ${noticia.fechaFormateada}
              </small>
              <span class="badge bg-primary">Noticia</span>
            </div>
            
            <h1 class="display-5 fw-bold text-dark mb-3">${noticia.titulo}</h1>
            
            <div class="d-flex align-items-center">
              <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                   style="width: 40px; height: 40px;">
                <i class="bi bi-person-fill text-white"></i>
              </div>
              <div>
                <p class="mb-0 fw-semibold">${noticia.nombreAutor}</p>
                <small class="text-muted">Autor</small>
              </div>
            </div>
          </header>

          <!-- Contenido -->
          <div class="news-content mb-5">
            <div class="content-html">
              ${noticia.contenidoHTML || '<p class="text-muted">Contenido no disponible.</p>'}
            </div>
          </div>

          <!-- Acciones -->
          <footer class="border-top pt-4 no-print">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-primary" id="share-btn">
                <i class="bi bi-share me-1"></i>Compartir
              </button>
              <button class="btn btn-outline-secondary" id="print-btn">
                <i class="bi bi-printer me-1"></i>Imprimir
              </button>
              ${isAdmin ? `
              <button class="btn btn-outline-danger" id="delete-btn">
                <i class="bi bi-trash me-1"></i>Eliminar
              </button>` : ''}
            </div>
          </footer>
        </article>
      </div>
    `

    // Event listeners
    this.root.querySelector('#share-btn')?.addEventListener('click', () => {
      this.emit('share', noticia)
    })

    this.root.querySelector('#print-btn')?.addEventListener('click', () => {
      this._printNoticia()
    })

    const deleteBtn = this.root.querySelector('#delete-btn')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.emit('delete', noticia.id))
    }
  }

  _printNoticia() {
    const printContent = this.root.querySelector('#printable-content').innerHTML;
    // Crear una ventana de impresión temporal
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.title}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
              .badge { border: 1px solid #ccc; }
              img { max-width: 100% !important; height: auto !important; }
            }
            .news-article { max-width: 100%; }
            .content-html { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }
}
