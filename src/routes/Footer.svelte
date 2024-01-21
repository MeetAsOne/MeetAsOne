<script>
    import { Navbar, NavBrand } from "flowbite-svelte";
    import { DarkMode } from "flowbite-svelte";
</script>

<footer>
    <Navbar>
        <NavBrand >
            <!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
            <span
                class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
            >
                Scroll to Top
                </span
            >
        </NavBrand>
        <!-- <h2
			style="font-weight: bold; text-transform: uppercase; text-align: center; font-size: 24px; margin-top: 0px"
		>
			HAPPY MEETINGS :)
		</h2> -->
        
        <div>
            <DarkMode />
        </div>
    </Navbar>
</footer>
