import html from 'tagged-template-noop'
import { generateMapCard } from "./mapper"
import { style } from "./style"

export function generateMapFile(tree) {
    return html`
        ${generateMapCard(tree)}

        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/codemirror.min.js"
                integrity="sha512-2cmTnLqUwlJs8HnJF3SvFKcsdRf65Ho7wof0IeydYXnyWCiVhaR6u2zTD/BFS+2mIywyiUscY1Er54SS+OJjEw=="
                crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/codemirror.min.css"
              integrity="sha512-uf06llspW44/LZpHzHT6qBOIVODjWtv4MxCricRxkzvopAlSWnTf6hpZTFxuuZcuNE9CBQhqE0Seu1CoRk84nQ=="
              crossorigin="anonymous" referrerpolicy="no-referrer"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/mode/javascript/javascript.min.js"
                integrity="sha512-I6CdJdruzGtvDyvdO4YsiAq+pkWf2efgd1ZUSK2FnM/u2VuRASPC7GowWQrWyjxCZn6CT89s3ddGI+be0Ak9Fg=="
                crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script>
            document.querySelectorAll('textarea.code').forEach(te => {
                const editor = CodeMirror.fromTextArea(te, {
                    lineNumbers: true
                });
            })
        </script>

        ${style}
    `
}
