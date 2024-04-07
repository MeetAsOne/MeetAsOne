<!-- Adapted from codepen.io/parthv2/pen/BavyJog -->

<div class="competitor-container">
    <div class="my-shadow"></div>
    <div class="textBox animate">
        <ul>
            <li>When2Meet</li>
            <li>LettuceMeet</li>
            <li>Doodle</li>
            <li>When2Meet</li>
        </ul>
    </div>
</div>

<style lang="scss">
  .competitor-container {
    display: inline-flex;
    align-items: center;
    height: 4rem;
    position: relative;
  }

  .my-shadow {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: linear-gradient(0deg, var(--color-bg-1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, var(--color-bg-1) 100%);
  }

  .textBox {
    height: 4rem;
    margin: auto;
    overflow: hidden;

    ul {
      padding: 0;
      /* Don't repeat infinitely b/c accessibility https://webaim.org/standards/wcag/checklist#sc2.2.2 */
      animation: scrollUp 9s forwards 1s ease-out infinite;
      width: max-content;

      li {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 4rem;
        list-style: none;
        line-break: strict;
      }
    }
  }

  .textBoxNotVisible {
    height: 4rem;
    margin: auto;
    overflow: hidden;
  }

  // Variables
  $item-count: 4;
  $time-out: calc(100 / ($item-count - 1));

  @keyframes scrollUp {
    @for $i from 1 through ($item-count - 1) {
      #{$i * $time-out - 10%},
      #{$i * $time-out * 1%} {
        transform: translateY(calc(-100% / $item-count) * $i);
      }
    }
  }
</style>
