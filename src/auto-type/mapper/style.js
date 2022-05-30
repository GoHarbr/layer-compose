import html from "tagged-template-noop"

export const style = html`
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato&family=Lora&display=swap" rel="stylesheet">


    <style>
        body {
            font-family: Lato, sans-serif;
        }
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
            /*font-weight: bold;*/
            padding: 0.3em;
            font-family: Lora, serif;
        }

        .card .title .breadcrumbs {
            display: none;
        }


        .sidebar {
            background-color: #C37AFF0A;
            /*width: 25%;*/
            min-width: 250px;
            max-width: 400px;
            border-left: 7px solid #7933B260;
        }
        
        .sidebar.active {
            max-width: 700px;
        }

        .window {
            padding: 1em;
        }


        .function-calls {
            padding: 0.5em 0.5em 0.5em 1.5em;
            flex-direction: column;
        }

        .layer, .function-call {
            background-color: white;
            border-bottom: 1px solid lightgray;
            margin-bottom: 1em;
        }

        .function-call {
            margin-bottom: 1em;
            width: 100%;
        }

        .function-body .CodeMirror {
            height: unset;
        }

        .function-name {
            font-weight: bold;
            font-family: Lora, serif;
            background-color: white;
        }
        
        .function-calls .function-name {
            position: relative;
            left: -1em;
        }

        .function-location {
            display: flex;
            justify-content: end;
            font-size: 0.7em;
        }
    </style>

`
