import EventEmitter from '../core/EventEmitter.js'

// Vista de Registro: renderiza el formulario y emite 'submit'
export default class RegisterView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('register-view')
    this._render()
  }

  _render() {
    this.root.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card shadow-sm overflow-hidden">
            <div class="card-header register-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-person-plus-fill fs-5"></i>
                <div>
                  <div class="fw-semibold">Crear cuenta</div>
                  <small class="opacity-75">Únete para disfrutar de Undersounds</small>
                </div>
              </div>
              <i class="bi bi-music-note-beamed opacity-50 d-none d-md-block"></i>
            </div>
            <div class="card-body p-4">
              <div id="alerts" class="mb-3"></div>
              <form id="register-form" class="row g-3" novalidate>

                <div class="col-12 col-md-6">
                  <label for="name" class="form-label">Nombre</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input id="name" name="name" class="form-control" placeholder="Tu nombre" required />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input id="email" name="email" type="email" class="form-control" placeholder="tucorreo@example.com" required />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label for="userTypeId" class="form-label">Tipo de usuario</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-people"></i></span>
                    <select id="userTypeId" name="userTypeId" class="form-select" required>
                      <option value="" selected disabled>Selecciona un tipo</option>
                    </select>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label for="phone" class="form-label">Teléfono</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                    <input id="phone" name="phone" type="tel" class="form-control" placeholder="600123123" required />
                  </div>
                </div>

                <div class="col-12">
                  <label for="address" class="form-label">Dirección</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                    <input id="address" name="address" class="form-control" placeholder="C/ Ejemplo, 1, Ciudad" required />
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-floating">
                    <textarea id="description" name="description" class="form-control" placeholder="" style="height: 100px"></textarea>
                    <label for="description">Descripción (opcional)</label>
                  </div>
                </div>

                

                <div class="col-12 col-md-6">
                  <label for="password" class="form-label">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input id="password" name="password" type="password" class="form-control" placeholder="••••••••" minlength="6" required />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="confirm" class="form-label">Confirmar contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                    <input id="confirm" name="confirm" type="password" class="form-control" placeholder="Repite la contraseña" minlength="6" required />
                  </div>
                </div>

                <div class="col-12">
                  <button class="btn btn-primary w-100 py-2" type="submit">
                    <i class="bi bi-person-check-fill"></i> Registrarse
                  </button>
                  <div class="form-text text-center mt-2">Al registrarte aceptas nuestros términos y política de privacidad.</div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `

    this.$form = this.root.querySelector('#register-form')
    this.$alerts = this.root.querySelector('#alerts')
  this.$userType = this.root.querySelector('#userTypeId')
  

    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(this.$form) // conserva archivos
      this.emit('submit', fd)
    })

    
  }

  showErrors(errors = []) {
    if (!Array.isArray(errors)) errors = [String(errors)]
    this.$alerts.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <ul class="mb-0">
          ${errors.map((e) => `<li>${e}</li>`).join('')}
        </ul>
      </div>
    `
  }

  showSuccess(message = 'Registro completado') {
    this.$alerts.innerHTML = `
      <div class="alert alert-success" role="alert">
        ${message}
      </div>
    `
  }

  resetForm() {
    this.$form?.reset()
  }

  setUserTypes(types = []) {
    if (!this.$userType) return
    const current = this.$userType.value
    this.$userType.innerHTML = '<option value="" disabled selected>Selecciona un tipo</option>'
    types.forEach((t) => {
      const opt = document.createElement('option')
      opt.value = String(t.id ?? t.value ?? '')
      opt.textContent = String(t.name ?? t.label ?? '')
      this.$userType.appendChild(opt)
    })
    // restaurar selección si aplica
    if (current) this.$userType.value = current
  }
}
