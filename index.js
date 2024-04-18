const hp = document.querySelector(".home-page");
const app = document.querySelector(".app");

const tableArea = document.querySelector(".table");
const tableTextArea = document.querySelector(".table-text");

const logsArea = document.querySelector(".logs");
const logHoverDIV = document.querySelector(".log-hover");

let cells;

const SPEED = 1;

const CELL_SIZE = 64;
const SIZE = 3;
// const GOAL_STATE = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, false],
// ];

const GOAL_STATE = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, false],
];

let map = [];
let nums = [false];

for (let i = 1; i < SIZE ** 2; i++) {
    nums.push(i);
}

function initTable() {
    for (let i = 0; i < SIZE; i++) {
        const row = document.createElement("div");
        row.className = "row";
        map.push([]);
        for (let j = 0; j < SIZE; j++) {
            const cell = document.createElement("div");
            cell.className = "cell current-cell";
            row.appendChild(cell);

            const randomIndex = Math.floor(Math.random() * nums.length);
            map[i].push(nums[randomIndex]);
            nums.splice(randomIndex, 1);
        }
        tableArea.appendChild(row);
    }
    rows = document.querySelectorAll(".row");
}

initTable();

// map = [
//     [1, 3, 5],
//     [4, 2, false],
//     [7, 8, 6],
// ];

function initMap(map) {
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll(".cell");

        cells.forEach((cell, cellIndex) => {
            if (map[rowIndex][cellIndex]) {
                const block = document.createElement("div");
                block.className = "block";
                block.textContent = map[rowIndex][cellIndex];

                const cellY = cell.offsetTop;
                const cellX = cell.offsetLeft;

                block.style.top = `${cellY + 4}px`;
                block.style.left = `${cellX + 4}px`;

                tableArea.appendChild(block);
            }
        });
    });
}

initMap(map);

// this is bad coding but nothing to do :(
function initTableHTML(map, table) {
    for (let i = 0; i < SIZE; i++) {
        const row = document.createElement("div");
        row.className = "pseudo-row";
        for (let j = 0; j < SIZE; j++) {
            const cell = document.createElement("div");
            cell.className = "pseudo-cell";
            if (map[i][j]) {
                cell.innerHTML = `
                <div class="pseudo-block">${map[i][j]}</div> 
            `;
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

const initialTableArea = document.querySelector(".initial-table");
const goalTableArea = document.querySelector(".goal-table");

initTableHTML(map, initialTableArea);
initTableHTML(GOAL_STATE, goalTableArea);

// End of bad coding .d
// bcs i decided to change the design after several days and don't wanted to
// waste/spend my time with changing all the code for it :(

async function moveNumber(num, movement) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (map[i][j] == num) {
                let row = i;
                let col = j;
                if (movement == "up") {
                    row -= 1;
                } else if (movement == "down") {
                    row += 1;
                } else if (movement == "left") {
                    col -= 1;
                } else if (movement == "right") {
                    col += 1;
                }

                map[row][col] = num;
                map[i][j] = false;

                const currentCell = rows[i].querySelectorAll(".cell")[j];
                const movingCell = rows[row].querySelectorAll(".cell")[col];

                const blocks = document.querySelectorAll(".block");

                let block;
                for (let x = 0; x < blocks.length; x++) {
                    if (blocks[x].textContent == num) {
                        block = blocks[x];
                        break;
                    }
                }

                block.style.backgroundColor = "var(--blue)";
                await wait(250 / SPEED);
                block.style.top = `${movingCell.offsetTop + 4}px`;
                block.style.left = `${movingCell.offsetLeft + 4}px`;

                setTimeout(() => {
                    block.style.backgroundColor = "#232323";
                }, 500);

                return;
            }
        }
    }
}

function findMoves(map) {
    const movements = ["up", "down", "left", "right"];
    let neighbors = [];
    let possibilities = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (map.map[i][j] == false) {
                for (let x = 0; x < 4; x++) {
                    try {
                        const rowIndex =
                            x < 2 ? (x % 2 == 0 ? i + 1 : i - 1) : i;
                        const colIndex =
                            x >= 2 ? (x % 2 == 0 ? j + 1 : j - 1) : j;
                        const num = map.map[rowIndex][colIndex];

                        if (num) {
                            neighbors.push({
                                row: rowIndex,
                                col: colIndex,
                                position: movements[x],
                                num: num,
                            });

                            const possibilityMap = JSON.parse(
                                JSON.stringify(map.map)
                            );
                            possibilityMap[i][j] = num;
                            possibilityMap[rowIndex][colIndex] = false;
                            const possibility = {
                                parents: [...map.parents, map],
                                heuristics: findHeuristics(possibilityMap),
                                map: possibilityMap,
                                movement: movements[x],
                                movedNum: num,
                                step: map.step + 1,
                            };
                            possibilities.push(possibility);
                        }
                    } catch {}
                }

                break;
            }
        }
    }

    return possibilities;
}

function findHeuristics(map) {
    let heuristics = 0;
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const num = map[i][j];

            let originalRow;
            let originalCol;

            for (let ii = 0; ii < SIZE; ii++) {
                for (let jj = 0; jj < SIZE; jj++) {
                    if (GOAL_STATE[ii][jj] == num) {
                        originalRow = ii;
                        originalCol = jj;
                    }
                }
            }

            const cellDistance =
                Math.abs(originalRow - i) + Math.abs(originalCol - j);

            heuristics += cellDistance;
        }
    }

    return heuristics;
}

function findPath(paths) {
    paths.sort((a, b) => a.heuristics - b.heuristics);
    return paths[0];
}

function solvePuzzle() {
    let paths = [
        {
            parents: [],
            heuristics: findHeuristics(map),
            map: map,
            step: 0,
        },
    ];

    let controlledMaps = [map];

    let isFound = false;
    let index = 0;

    let path;

    while (!isFound && index <= 1000) {
        const closestPath = findPath(paths);
        const possibilities = findMoves(closestPath);

        paths = paths.filter((path) => path != closestPath);

        possibilities.forEach((possibility) => {
            if (possibility.heuristics == 0) {
                isFound = true;
                path = possibility;
            }

            if (!isContains(controlledMaps, possibility.map)) {
                paths.push(possibility);
                controlledMaps.push(possibility.map);
            }
        });

        index++;
    }

    if (path) {
        visualizeSolution(path);
    } else {
        app.style.display = "none";
        hp.style.display = "flex";
    }
}

function initLogs(path) {
    for (let i = 1; i < path.parents.length + 1; i++) {
        const logDiv = document.createElement("div");
        logDiv.className = "log";
        let text;

        if (i == path.parents.length) {
            text = `<div class="log-index">${i}</div> <div class="log-text">${path.movedNum} <i class="log-icon fa-solid fa-arrow-${path.movement}"></i></div>`;
        } else {
            text = `<div class="log-index">${i}</div> <div class="log-text">${path.parents[i].movedNum} <i class="log-icon fa-solid fa-arrow-${path.parents[i].movement}"></i></div>`;
        }

        logDiv.innerHTML = text;
        logsArea.appendChild(logDiv);
    }
}

async function visualizeSolution(path) {
    initLogs(path);

    let currentStep = 1;
    const logs = document.querySelectorAll(".log");
    for (let i = 1; i < path.parents.length; i++) {
        tableTextArea.textContent = `Current State: ${i} / ${path.step}`;

        const posY = logs[i - 1].offsetTop;
        const posX = logs[i - 1].offsetLeft;
        logs[i - 1].classList.add("active-log");
        logHoverDIV.style.top = `${posY}px`;
        logHoverDIV.style.left = `${posX}px`;

        const initializingMap = path.parents[i];
        const num = initializingMap.movedNum;
        const movement = initializingMap.movement;
        moveNumber(num, movement);
        await wait(1000 / SPEED);
        logs[i - 1].classList.remove("active-log");

        currentStep += 1;
    }

    const posY = logs[logs.length - 1].offsetTop;
    logs[logs.length - 1].classList.add("active-log");
    logHoverDIV.style.top = `${posY}px`;

    moveNumber(path.movedNum, path.movement);
    tableTextArea.textContent = `Current State: ${currentStep} / ${path.step}`;

    currentStep += 1;

    setTimeout(() => {
        const blocks = document.querySelectorAll(".block");
        blocks.forEach((block) => {
            block.style.backgroundColor = "var(--green)";
        });
    }, 1000);
}

//  check for if is there any movements that results same in one path!!!
// and make log table and change it dynamically

function wait(duration) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

function isContains(arr, target) {
    return arr.some((item) => JSON.stringify(item) === JSON.stringify(target));
}

solvePuzzle();
