<!-- Adapted from codepen.io/parthv2/pen/BavyJog -->

<div class="competitor-container">
    <div class="textBox animate">
        <ul>
            <li>When2Meet</li>
            <li>LettuceMeet</li>
            <li>Rallly</li>
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
  }

  .textBox {
    height: 4rem;
    margin: auto;
    overflow: hidden;

    ul {
      padding: 0;
      /* Don't repeat infinitely b/c accessibility https://webaim.org/standards/wcag/checklist#sc2.2.2 */
      animation: scrollUp 4s forwards 1s ease-out infinite;
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
  $item-count: 5;
  $time-out: 100 / ($item-count - 1);

  @keyframes scrollUp {
    @for $i from 1 through ($item-count - 1) {
      #{$i * $time-out - 10%},
      #{$i * $time-out * 1%} {
        transform: translateY((-100% / $item-count) * $i);
      }

      #{$i * $time-out - 7.5%} {
        transform: translateY(((-100% / $item-count) * $i) + 1.5%);
      }
    }
  }
</style>
