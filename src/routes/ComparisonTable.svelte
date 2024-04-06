<script>
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
</script>

<Table color="custom">
    <TableHead>
        <TableHeadCell>Feature</TableHeadCell>
        <TableHeadCell>MeetAsOne</TableHeadCell>
        <TableHeadCell>When2Meet</TableHeadCell>
        <TableHeadCell>LettuceMeet</TableHeadCell>
        <TableHeadCell>Doodle</TableHeadCell>
        <TableHeadCell>Rallly</TableHeadCell>
    </TableHead>
    <TableBody class="divide-y">
        <TableBodyRow>
            <TableBodyCell>Import from screenshot</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
            <TableBodyCell>Save & load availability across multiple polls</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
            <TableBodyCell>Mobile-friendly</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell><abbr title="Cannot drag to multiselect times on mobile">*️⃣</abbr></TableBodyCell>
            <TableBodyCell>❔</TableBodyCell>
            <TableBodyCell>❔</TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
            <TableBodyCell>Timezone translation</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
            <TableBodyCell><abbr title="Only local timezone, cannot switch to others">*️⃣</abbr></TableBodyCell>
            <TableBodyCell>❔</TableBodyCell>
            <TableBodyCell>❔</TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
            <TableBodyCell>Open Source</TableBodyCell>
            <TableBodyCell>
                <a href="https://github.com/MeetAsOne/MeetAsOne" target="_blank">✅<br />GitHub</a>
            </TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell><abbr title="There's an unofficial open-source inspired repo called CabbageMeet">*️⃣</abbr></TableBodyCell>
            <TableBodyCell>❌</TableBodyCell>
            <TableBodyCell>✅</TableBodyCell>
        </TableBodyRow>
    </TableBody>
</Table>

<style>
    :global(tr > :first-child) {
        color: black !important;
    }

    :global(tr > :not(:first-child)) {
        text-align: center;
    }
</style>
