import html from 'tagged-template-noop'

export const scripts = html`
    <script>
        // document.querySelectorAll('form.editor').forEach(form => {
        //
        // })

        up.compiler('textarea.code', te => {
            startEditor(te)
        })

        let activeSidebar
        document.querySelectorAll('.sidebar').forEach(sb => {
            sb.addEventListener('click', (t) => {
                activeSidebar && activeSidebar.classList.remove('active')
                sb.classList.add('active')

                activeSidebar = sb
            })
        })

        up.compiler('.function-call', fnCallElem => {
            const name = fnCallElem.querySelector('.function-name')
            
            name.addEventListener('click', () => toggleCodeDisplay(fnCallElem))
        })
        
        up.compiler('.controls', gc => {
            gc.querySelector('.collapse').addEventListener('click', () => {
                gc.parentElement.querySelectorAll('.function-call').forEach(fc => {
                    toggleCodeDisplay(fc, true)
                })
            })
            
            gc.querySelector('.expand').addEventListener('click', () => {
                gc.parentElement.querySelectorAll('.function-call').forEach(fc => {
                    toggleCodeDisplay(fc, false)
                })
            })
        })

        function toggleCodeDisplay(fnCallElem, force) {
            const defsList = fnCallElem.querySelector('.function-defs-list')

            fnCallElem.classList.toggle('collapsed', force)

            if (!fnCallElem.classList.contains('collapsed')) {
                defsList.querySelectorAll('textarea.code').forEach(startEditor)
            }
        }

        function startEditor(textarea) {
            const form = textarea.parentElement
            const editor = CodeMirror.fromTextArea(textarea, {
                lineNumbers: true
            });

            editor.on('blur', () => {
                editor.save()
                up.submit(form, { method: 'post', navigate: false, target: '#' + form.id })
            })
        }
    </script>
`
