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
        height: 41.6px;  /* TODO: don't use magic constants. This ensures no layout shifting when toggling weekday/date mode */
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .slider {
        display: flex;
        align-items: center;
        cursor: pointer;
        background-color: rgb(55 65 81);
        color: white;
        user-select: none;
        transition: .4s;
        height: 100%;
    }

    input:checked + .slider {
        background-color: var(--color-theme);
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
    }

</style>
