<script>
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const times = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
  
    let availability = times.map(() => new Array(days.length).fill(false));
  
    let isDragging = false;
    let dragState = null;
  
    const toggleAvailability = (dayIndex, timeIndex) => {
      if (dragState === null) {
        dragState = !availability[timeIndex][dayIndex];
      }
  
      availability[timeIndex][dayIndex] = dragState;
    };
  
    const handleMouseDown = (dayIndex, timeIndex) => {
      isDragging = true;
      toggleAvailability(dayIndex, timeIndex);
    };
  
    const handleMouseEnter = (dayIndex, timeIndex) => {
      if (isDragging) {
        toggleAvailability(dayIndex, timeIndex);
      }
    };
  
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        dragState = null;
      }
    };
  
    // You would typically handle the actual saving of the availability state to some backend or storage here
    const saveAvailability = () => {
      console.log('Saving Availability:', availability);
    };
  </script>
  
  <style>
    .availability-grid {
      user-select: none;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      cursor: pointer;
    }
    .availability-cell {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: center;
      background-color: #f8f8f8;
    }
    .available {
      background-color: #90ee90;
    }
  </style>
  
  <div>
    <h2>Seth Deegan's Availability</h2>
    <p>Click and Drag to Toggle; Saved Immediately</p>
    <div class="availability-grid">
      {#each times as time, timeIndex}
        {#each days as day, dayIndex}
          <div 
            class="availability-cell {availability[timeIndex][dayIndex] ? 'available' : ''}"
            on:mousedown={() => handleMouseDown(dayIndex, timeIndex)}
            on:mouseenter={() => handleMouseEnter(dayIndex, timeIndex)}
            on:mouseup={handleMouseUp}>
            {timeIndex === 0 ? day : ''}
          </div>
        {/each}
      {/each}
    </div>
  </div>
  