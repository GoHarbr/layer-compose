import html from 'tagged-template-noop'
import { generateMapCard } from "./mapper"
import { style } from "./style"
import { scripts } from "./scripts.js"

export function generateMapFile(tree) {
    return html`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/codemirror.min.js"
                    integrity="sha512-2cmTnLqUwlJs8HnJF3SvFKcsdRf65Ho7wof0IeydYXnyWCiVhaR6u2zTD/BFS+2mIywyiUscY1Er54SS+OJjEw=="
                    crossorigin="anonymous" referrerpolicy="no-referrer"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/codemirror.min.css"
                  integrity="sha512-uf06llspW44/LZpHzHT6qBOIVODjWtv4MxCricRxkzvopAlSWnTf6hpZTFxuuZcuNE9CBQhqE0Seu1CoRk84nQ=="
                  crossorigin="anonymous" referrerpolicy="no-referrer"/>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.4/mode/javascript/javascript.min.js"
                    integrity="sha512-I6CdJdruzGtvDyvdO4YsiAq+pkWf2efgd1ZUSK2FnM/u2VuRASPC7GowWQrWyjxCZn6CT89s3ddGI+be0Ak9Fg=="
                    crossorigin="anonymous" referrerpolicy="no-referrer"></script>

            <script src="https://unpkg.com/unpoly@2.5.1/unpoly.min.js"></script>
            <link rel="stylesheet" href="https://unpkg.com/unpoly@2.5.1/unpoly.min.css">
            <title></title>
        </head>
        <body>
        
        <div class="controls" id="global-controls">
            <button class="collapse" id="control-collapse-all">collapse all</button>
            <button class="expand" id="control-expand-all">expand all</button>
        </div>
        
        ${generateMapCard(tree)}

        ${scripts}
        ${style}
        </body>
        </html>
    `
}
