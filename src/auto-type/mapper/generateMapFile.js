import html from 'tagged-template-noop'
import { generateMapCard } from "./mapper"

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

        <style>
            .layers, .card, .function-calls {
                display: flex;
            }

            /* todo remove*/
            .layers {
                display: none;
            }

            .card {
                margin-bottom: 1em;
            }

            .card .title {
                font-size: 1.2em;
            }

            .card .title .name {
                font-weight: bold;
                padding: 0.3em;
            }

            .card .title .breadcrumbs {
                display: none;
            }


            .sidebar {
                background-color: #C37AFF0A;
                width: 25%;
                min-width: 250px;
                max-width: 400px;
                border-left: 1px solid #7933B260;
            }

            .window {
                padding: 1em;
            }


            .function-calls {
                padding: 0.5em 0.5em 0.5em 1em;
                flex-direction: column;
            }

            .layer, .function-call {
                background-color: white;
                border-bottom: 1px solid lightgray;
                margin-bottom: 1em;
            }

            .function-call {
                margin-bottom: 0.3em;
                width: 100%;
            }

            .function-body .CodeMirror {
                height: unset;
            }
        </style>
    `
}
