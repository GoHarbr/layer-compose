import html from 'tagged-template-noop'

export const scripts = html`
    <script>
        // document.querySelectorAll('form.editor').forEach(form => {
        //
        // })
        
        up.compiler('textarea.code', te => {
            // const te = form.querySelector('textarea.code')
            const form = te.parentElement
            const editor = CodeMirror.fromTextArea(te, {
                lineNumbers: true
            });

            editor.on('blur', () => {
                editor.save()
                up.submit(form, {method: 'post', navigate: false, target: '#' + form.id})
            })
            
        })
        
        let activeSidebar
        document.querySelectorAll('.sidebar').forEach(sb => {
            sb.addEventListener('click', (t) => {
                activeSidebar && activeSidebar.classList.remove('active')
                sb.classList.add('active')
                
                activeSidebar = sb
            })
        })
    </script>
    `
