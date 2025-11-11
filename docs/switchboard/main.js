title = "SWITCHBOARD";
description = `[Hold] Connect calls`;
options = {
  viewSize: { x: 100, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  textEdgeColor: { title: "light_blue" },
  audioSeed: 1,
  bgmVolume: 4,
};

audioFiles = {
  bgm: "./switchboard/Pixelated_Dreams.mp3",
  conn1: "./switchboard/connecting_1.mp3",
  conn2: "./switchboard/connecting_2.mp3",
  conn3: "./switchboard/connecting_3.mp3",
  conn4: "./switchboard/connecting_4.mp3",
  conn5: "./switchboard/connecting_5.mp3",
  conn6: "./switchboard/connecting_6.mp3",
  conn7: "./switchboard/connecting_7.mp3",
};

let plugs;
let cursor;
let connectionRequests;
let connectionLine;
let activeConnections;
let contractsLost;
let nextRequestTimer;
let multiplier;

function generateNewConnectionRequest() {
  // Get IDs of plugs that are currently in use
  const busyPlugIds = new Set();
  activeConnections.forEach((connection) => {
    busyPlugIds.add(connection.from);
    busyPlugIds.add(connection.to);
  });

  // Also add plugs that already have pending requests (both from and to)
  connectionRequests.forEach((request) => {
    busyPlugIds.add(request.from);
    busyPlugIds.add(request.to);
  });

  // Create list of available plug IDs
  const availablePlugIds = [];
  for (let i = 1; i <= 9; i++) {
    if (!busyPlugIds.has(i)) {
      availablePlugIds.push(i);
    }
  }

  // Generate new request - only active plugs can initiate, but can connect to any available plug
  const activeAvailablePlugs = availablePlugIds.filter((id) => {
    const plug = plugs.find((p) => p.id === id);
    return plug && plug.active;
  });

  if (activeAvailablePlugs.length >= 1 && availablePlugIds.length >= 2) {
    // Source must be active
    const fromIndex = rndi(activeAvailablePlugs.length);
    const fromId = activeAvailablePlugs[fromIndex];

    // Destination can be any available plug (including grayed out)
    let toId;
    do {
      const toIndex = rndi(availablePlugIds.length);
      toId = availablePlugIds[toIndex];
    } while (toId === fromId);

    const timeLimit = floor(rnd(600, 1200) / sqrt(difficulty));

    connectionRequests.push({
      from: fromId,
      to: toId,
      timeLimit: timeLimit,
      maxTimeLimit: timeLimit,
    });
  }
}

function update() {
  if (!ticks) {
    // Initialize: arrange 9 plugs in a circle
    plugs = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 30;

    for (let i = 0; i < 9; i++) {
      const angle = (i * Math.PI * 2) / 9 - Math.PI / 2; // Start from 12 o'clock
      plugs.push({
        id: i + 1,
        pos: vec(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        ),
        active: true,
      });
    }

    // Initialize cursor (start from first plug)
    cursor = {
      currentPlugIndex: 0,
      angle: -Math.PI / 2,
      speed: 0.03, // radians per frame
    };

    // Initialize connection requests system
    connectionRequests = [];

    // Add initial connection request (3 → 7)
    connectionRequests.push({
      from: 3,
      to: 7,
      timeLimit: 900, // 15 seconds timeout
      maxTimeLimit: 900,
    });

    // Initialize timer for next requests
    nextRequestTimer = 180;

    connectionLine = {
      active: false,
      startPos: null,
      currentPos: null,
      startPlugId: null,
      endPlugId: null,
    };

    activeConnections = [];
    contractsLost = 0;
    multiplier = 1;
  }

  // Update cursor movement
  cursor.angle +=
    cursor.speed * sqrt(difficulty) * (input.isPressed ? 0.8 : 1.4);
  if (cursor.angle >= Math.PI * 2 - Math.PI / 2) {
    cursor.angle = -Math.PI / 2;
  }

  // Calculate cursor position
  const centerX = 50;
  const centerY = 50;
  const radius = 30;
  const cursorPos = vec(
    centerX + Math.cos(cursor.angle) * radius,
    centerY + Math.sin(cursor.angle) * radius
  );

  // Update current plug index
  let minDistance = Infinity;
  let closestPlugIndex = 0;
  plugs.forEach((plug, index) => {
    const distance = cursorPos.distanceTo(plug.pos);
    if (distance < minDistance) {
      minDistance = distance;
      closestPlugIndex = index;
    }
  });
  cursor.currentPlugIndex = closestPlugIndex;

  // Update multiplier (decreases slightly each frame)
  multiplier -= (multiplier - 1) * 0.001;

  // Generate new connection requests periodically
  nextRequestTimer--;
  if (nextRequestTimer <= 0) {
    generateNewConnectionRequest();
    // Set timer for next request (3-6 seconds)
    nextRequestTimer = Math.floor(rnd(100, 200) / sqrt(difficulty));
  }

  // Handle connection request timeouts
  connectionRequests.forEach((request, index) => {
    request.timeLimit--;
    if (request.timeLimit <= 0) {
      // Timeout - lose contract for source plug
      const fromPlug = plugs.find((p) => p.id === request.from);
      if (fromPlug) {
        fromPlug.active = false;
        contractsLost++;
        play("laser", { pitch: 44 });

        if (contractsLost >= 3) {
          end();
        }
      }
      connectionRequests.splice(index, 1);
    }
  });

  // Input processing
  if (input.isJustPressed && !connectionLine.active) {
    // Find closest active plug for start
    let closestPlug = null;
    let minDistance = Infinity;
    plugs.forEach((plug) => {
      if (plug.active) {
        const distance = cursorPos.distanceTo(plug.pos);
        if (distance < minDistance) {
          minDistance = distance;
          closestPlug = plug;
        }
      }
    });

    if (closestPlug) {
      connectionLine.active = true;
      connectionLine.startPos = vec(closestPlug.pos);
      connectionLine.startPlugId = closestPlug.id;
      connectionLine.currentPos = vec(closestPlug.pos);
      play("select", { pitch: 40 });
    }
  }

  if (input.isPressed && connectionLine.active) {
    // Make connection line follow cursor
    connectionLine.currentPos = vec(cursorPos);
  }

  if (input.isJustReleased && connectionLine.active) {
    // Find closest plug for end (including grayed out plugs)
    let closestPlug = null;
    let minDistance = Infinity;
    plugs.forEach((plug) => {
      const distance = cursorPos.distanceTo(plug.pos);
      if (distance < minDistance) {
        minDistance = distance;
        closestPlug = plug;
      }
    });

    if (closestPlug) {
      connectionLine.endPlugId = closestPlug.id;

      // Check if this matches any pending requests
      let requestMatched = false;
      connectionRequests.forEach((request, index) => {
        const isCorrectConnection =
          (connectionLine.startPlugId === request.from &&
            closestPlug.id === request.to) ||
          (connectionLine.startPlugId === request.to &&
            closestPlug.id === request.from);

        if (isCorrectConnection) {
          // Success - create active connection
          const fromPlug = plugs.find((p) => p.id === request.from);
          const toPlug = plugs.find((p) => p.id === request.to);
          const duration = floor(rnd(100, 200) / sqrt(difficulty));

          activeConnections.push({
            from: request.from,
            to: request.to,
            fromPos: vec(fromPlug.pos),
            toPos: vec(toPlug.pos),
            duration,
            timeLeft: duration,
          });

          // Restore contracts if connecting to grayed out plugs
          if (!fromPlug.active) {
            fromPlug.active = true;
            contractsLost = Math.max(0, contractsLost - 1);
          }
          if (!toPlug.active) {
            toPlug.active = true;
            contractsLost = Math.max(0, contractsLost - 1);
          }

          // Calculate score based on multiplier
          const scoreGained = Math.round(multiplier);
          addScore(scoreGained, cursorPos);

          // Increase multiplier for consecutive connections
          multiplier++;

          play(`conn${rndi(1, 8)}`, { volume: 3 });
          connectionRequests.splice(index, 1);
          requestMatched = true;
        }
      });

      // Check if connection involves any requesting plug incorrectly
      if (!requestMatched) {
        connectionRequests.forEach((request, index) => {
          if (
            connectionLine.startPlugId === request.from ||
            closestPlug.id === request.from
          ) {
            // Wrong connection involving the requesting plug - lose contract
            const fromPlug = plugs.find((p) => p.id === request.from);
            if (fromPlug) {
              fromPlug.active = false;
              contractsLost++;
              play("laser", { pitch: 44 });

              if (contractsLost >= 3) {
                end();
              }
            }
            connectionRequests.splice(index, 1);
          }
        });
      }
      // If no active request, connection just disappears
    }

    connectionLine.active = false;
    connectionLine.startPos = null;
    connectionLine.currentPos = null;
    connectionLine.startPlugId = null;
    connectionLine.endPlugId = null;
  }

  // Update active connections
  activeConnections.forEach((connection, index) => {
    connection.timeLeft--;
    if (connection.timeLeft <= 0) {
      activeConnections.splice(index, 1);
      play("click", { pitch: 40 }); // disconnect sound
    }
  });

  // Draw plugs
  plugs.forEach((plug) => {
    // Outer black frame (smaller)
    color("black");
    box(plug.pos, 7);

    // Inner part (white if active, gray if contract lost)
    color(plug.active ? "white" : "light_black");
    box(plug.pos, 4);

    // Plug number display (toward screen center, further inside)
    const centerX = 50;
    const centerY = 50;
    const directionToCenter = vec(
      centerX - plug.pos.x,
      centerY - plug.pos.y
    ).normalize();
    const numberPos = vec(
      plug.pos.x + directionToCenter.x * 10,
      plug.pos.y + directionToCenter.y * 10
    );

    color("black");
    text(plug.id.toString(), numberPos, {
      isSmallText: true,
    });
  });

  // Display all connection requests
  connectionRequests.forEach((request) => {
    const fromPlug = plugs.find((p) => p.id === request.from);
    if (fromPlug) {
      // Display destination number outside of source plug (toward screen edge)
      const centerX = 50;
      const centerY = 50;
      const directionFromCenter = vec(
        fromPlug.pos.x - centerX,
        fromPlug.pos.y - centerY
      ).normalize();
      const requestPos = vec(
        fromPlug.pos.x + directionFromCenter.x * 10,
        fromPlug.pos.y + directionFromCenter.y * 10
      );

      color("red");
      text(request.to.toString(), requestPos, {
        isSmallText: true,
      });

      // Display timeout bar below the number
      const timeProgress = request.timeLimit / (1000 / sqrt(difficulty));
      const barWidth = 10 * timeProgress;
      const barPos = vec(requestPos.x - 5, requestPos.y + 4);

      color("red");
      rect(barPos.x, barPos.y, barWidth, 1);
    }
  });

  // Draw cursor
  color("blue");
  box(cursorPos, 6);

  // Draw active connection lines (during call)
  activeConnections.forEach((connection) => {
    color("cyan");
    // Draw sagging line with gravity effect
    const startPos = connection.fromPos;
    const endPos = connection.toPos;
    const distance = startPos.distanceTo(endPos);
    const sag = distance * 0.15; // Sag amount based on distance

    // Calculate middle point with downward sag
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2 + sag;
    const controlPoint = vec(midX, midY);

    // Draw curved line using multiple segments
    const segments = 10;
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      // Quadratic Bezier curve calculation
      const p1 = vec(
        (1 - t1) * (1 - t1) * startPos.x +
          2 * (1 - t1) * t1 * controlPoint.x +
          t1 * t1 * endPos.x,
        (1 - t1) * (1 - t1) * startPos.y +
          2 * (1 - t1) * t1 * controlPoint.y +
          t1 * t1 * endPos.y
      );
      const p2 = vec(
        (1 - t2) * (1 - t2) * startPos.x +
          2 * (1 - t2) * t2 * controlPoint.x +
          t2 * t2 * endPos.x,
        (1 - t2) * (1 - t2) * startPos.y +
          2 * (1 - t2) * t2 * controlPoint.y +
          t2 * t2 * endPos.y
      );

      line(p1, p2, 3);
    }

    // Display call time progress bar at source plug position
    const fromPlug = plugs.find((p) => p.id === connection.from);
    if (fromPlug) {
      const centerX = 50;
      const centerY = 50;
      const directionFromCenter = vec(
        fromPlug.pos.x - centerX,
        fromPlug.pos.y - centerY
      ).normalize();
      const barPos = vec(
        fromPlug.pos.x + directionFromCenter.x * 10 - 5,
        fromPlug.pos.y + directionFromCenter.y * 10 + 4
      );

      const timeProgress = connection.timeLeft / (500 / sqrt(difficulty));
      const barWidth = 10 * timeProgress;

      color("blue");
      rect(barPos.x, barPos.y, barWidth, 1);
    }
  });

  // Draw connection line (during operation)
  if (
    connectionLine.active &&
    connectionLine.startPos &&
    connectionLine.currentPos
  ) {
    color("yellow");
    line(connectionLine.startPos, connectionLine.currentPos, 2);
  }

  color("black");
  text(`x${round(multiplier)}`, 3, 9, { isSmallText: true });
}
