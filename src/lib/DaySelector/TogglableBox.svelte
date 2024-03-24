<script>
    export let checked = false;
</script>

<label class="switch">
    <input type="checkbox" {checked}>
    <span class="slider"><slot></slot></span>
</label>

<style>
    .switch {
        flex-grow: 1;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .slider {
        display: inline-block;
        cursor: pointer;
        background-color: #ccc;
        transition: .4s;
        height: 100%;
    }

    input:checked + .slider {
        background-color: #2196F3;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
    }

</style>
