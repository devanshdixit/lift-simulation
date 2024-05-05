document.getElementById('setupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const floors = document.getElementById('floors').value;
    const lifts = document.getElementById('lifts').value;
    initializeSimulation(floors, lifts);
});

let liftDataStore = {
    lifts: [],
    floorRequestQueue: []
};

function initializeSimulation(floors, liftsCount) {
    const floorsContainer = document.getElementById('floorsContainer');
    const liftShaft = document.getElementById('liftShaft');
    floorsContainer.innerHTML = '';
    liftShaft.innerHTML = '';
    document.documentElement.style.setProperty('--floors', floors);
    for (let j = 0; j < liftsCount; j++) {
        const lift = document.createElement('div');
        lift.className = 'lift';
        lift.id = `lift${j}`;
        lift.style.bottom = '5px';
        lift.style.right = `${100 + ((j + 1) * 90)}px`;
        liftShaft.appendChild(lift);
    }
    liftDataStore.lifts = Array.from({ length: liftsCount }, (_, index) => ({
        id: `lift${index}`,
        currentFloor: 1,
        direction: 'idle',
        moving: false,
        doorOpen: false,
        queue: []
    }));

    for (let i = floors - 1; i >= 0; i--) {
        let floorDiv = document.createElement('div');
        floorDiv.className = 'floor';
        if (i !== 0) {
            floorDiv.innerHTML = `
                <div class="sect">
                    <div class="buttongroup">
                        <button onclick="callLift(${i + 1}, 'up')">Up</button>
                        <button onclick="callLift(${i + 1}, 'down')">Down</button>
                    </div>
                    <div class="liftarea"></div>
                </div>
                <div class="basefloor" id="floor${i + 1}">
                    <div class="basefloorline" id="floor${i+1}"></div>
                    <div class="floortext">Floor ${i + 1}</div>
                </div>
            `;
        } else {
            floorDiv.innerHTML = `
                <div class="sect">
                    <div class="buttongroup">
                        <button onclick="callLift(${i + 1}, 'up')">Up</button>
                    </div>
                    <div class="liftarea"></div>
                </div>
                <div class="basefloor">
                    <div class="basefloorline" id="floor${i+1}"></div>
                    <div class="floortext">Floor ${i + 1}</div>
                </div>
            `;
        }
        floorsContainer.appendChild(floorDiv);
    }
}

function callLift(floor, direction) {
    let nearestLift = selectNearestLift(floor, direction);
    if (nearestLift) {
        if (nearestLift.doorOpen || nearestLift.moving) {
            nearestLift.queue.push({ floor, direction });
        } else {
            moveLift(nearestLift, floor);
        }
    }
}
function selectNearestLift(requestedFloor, direction) {
    let nearestLift = null;
    let minimumDistance = Number.MAX_VALUE;
    liftDataStore.lifts.forEach(lift => {
        let distance = Math.abs(requestedFloor - lift.currentFloor);
        if (distance < minimumDistance && (lift.direction === 'idle' || direction === lift.direction)) {
            nearestLift = lift;
            minimumDistance = distance;
        }
    });
    return nearestLift;
}function moveLift(lift, requestedFloor) {
    const liftElement = document.getElementById(lift.id);
    if (!liftElement) return;

    lift.moving = true;
    const floorHeight = 112;
    const travelTimePerFloor = 2000; 
    const floorsToMove = Math.abs(requestedFloor - lift.currentFloor);
    const totalTravelTime = floorsToMove * travelTimePerFloor;

    liftElement.style.transition = `bottom ${totalTravelTime}ms linear`;
    liftElement.style.bottom = `${(requestedFloor - 1) * floorHeight}px`;

    setTimeout(() => {
        lift.currentFloor = requestedFloor;
        lift.moving = false;
        openDoors(lift);
    }, totalTravelTime);
}

function openDoors(lift) {
    const liftElement = document.getElementById(lift.id);
    lift.doorOpen = true;
    liftElement.classList.add('doorsOpen');
    setTimeout(() => {
        liftElement.classList.remove('doorsOpen');
        lift.doorOpen = false;
        processQueue(lift);
    }, 5000);
}

function processQueue(lift) {
    if (lift.queue.length > 0) {
        const request = lift.queue.shift();
        moveLift(lift, request.floor);
    }
}
