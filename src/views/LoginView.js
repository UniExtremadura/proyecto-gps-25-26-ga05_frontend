import EventEmitter from '../core/EventEmitter.js'

export default class LoginView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('login-view')
    this._render()
  }

  _render() {
    this.root.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card shadow-sm overflow-hidden">
            <div class="card-header auth-header d-flex align-items-center gap-2">
              <i class="bi bi-box-arrow-in-right"></i>
              <strong>Iniciar sesión</strong>
            </div>
            <div class="card-body p-4">
              <div id="alerts" class="mb-3"></div>
              <form id="login-form" class="row g-3" novalidate>
                <div class="col-12">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input id="email" name="email" type="email" class="form-control" placeholder="tucorreo@example.com" required />
                  </div>
                </div>

                <div class="col-12">
                  <label for="password" class="form-label">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input id="password" name="password" type="password" class="form-control" placeholder="••••••••" minlength="6" required />
                  </div>
                </div>

                <div class="col-12 d-flex justify-content-between align-items-center">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="1" id="remember" name="remember">
                    <label class="form-check-label" for="remember">Recordarme</label>
                  </div>
                  <a href="#" class="small">¿Olvidaste tu contraseña?</a>
                </div>

                <div class="col-12">
                  <button class="btn btn-primary w-100 py-2" type="submit">
                    <i class="bi bi-box-arrow-in-right"></i> Entrar
                  </button>
                  <div class="form-text text-center mt-2">¿No tienes cuenta? <a href="#" id="link-to-register">Regístrate</a></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `

    this.$alerts = this.root.querySelector('#alerts')
    this.$form = this.root.querySelector('#login-form')
    this.$linkToRegister = this.root.querySelector('#link-to-register')

    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(this.$form).entries())
      this.emit('submit', data)
    })

    this.$linkToRegister?.addEventListener('click', (e) => {
      e.preventDefault()
      this.emit('goRegister')
    })
  }

  showErrors(errors = []) {
    if (!Array.isArray(errors)) errors = [String(errors)]
    this.$alerts.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <ul class="mb-0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>
      </div>
    `
  }

  showSuccess(message = 'Sesión iniciada') {
    this.$alerts.innerHTML = `
      <div class="alert alert-success" role="alert">${message}</div>
    `
  }
}
