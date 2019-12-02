export class Actor {
  pool = pool;
  func!: Function;
  isAlive = true;
  ticks = 0;
  updaterPool = new Pool();
  onRemove: Function | undefined;
  priority = 1;

  remove() {
    if (!this.isAlive) {
      return;
    }
    if (this.onRemove != null) {
      this.onRemove();
    }
    this.isAlive = false;
  }

  addUpdater(
    updateFunc: (updater: Updater, actor?: Actor) => void,
    interval = 1
  ) {
    const updater: Updater = new Updater(updateFunc, interval, this);
    this.updaterPool.add(updater);
    return updater;
  }

  setPool(pool: Pool) {
    this.pool = pool;
  }

  setPriority(priority: number) {
    this.priority = priority;
    this.pool.enablePriority();
  }

  init(initFunc: (actor: any, ...args: any[]) => void, ...args: any[]) {
    this.func = initFunc;
    initFunc(this, ...args);
    this.pool.add(this);
  }

  update() {
    this.updaterPool.update();
    this.ticks++;
  }
}

export interface AnyActor extends Actor {
  [key: string]: any;
}

export class Updater {
  func: Function;
  isAlive = true;
  ticks = 0;
  intervalTicks = 0;

  remove() {
    this.isAlive = false;
  }

  setInterval(interval: number) {
    this.interval = interval;
  }

  constructor(
    public updateFunc: (updater: Updater, actor?: Actor) => void,
    public interval: number,
    public actor?: Actor
  ) {
    this.func = updateFunc;
  }

  update() {
    this.intervalTicks--;
    if (this.intervalTicks <= 0) {
      this.updateFunc(this, this.actor);
      this.intervalTicks = this.interval;
    }
    this.ticks++;
  }
}

export interface UpdatedInstance {
  func: Function;
  isAlive: boolean;
  update: Function;
  remove: Function;
  priority?: number;
}

export class Pool {
  instances: UpdatedInstance[] = [];
  isRemovingAllInstances = false;
  isPriorityEnabled = false;

  add(instance: UpdatedInstance) {
    this.instances.push(instance);
  }

  update() {
    if (this.isPriorityEnabled) {
      this.instances = stableSort(
        this.instances,
        (a: any, b: any) => b.priority - a.priority
      );
    }
    for (let i = 0; i < this.instances.length; ) {
      if (this.isRemovingAllInstances) {
        this.isRemovingAllInstances = false;
        break;
      }
      const instance = this.instances[i];
      if (instance.isAlive) {
        instance.update();
      }
      if (instance.isAlive) {
        i++;
      } else {
        this.instances.splice(i, 1);
      }
    }
  }

  get(func?: Function) {
    return func == null
      ? this.instances.filter(a => a.isAlive)
      : this.instances.filter(a => a.func === func && a.isAlive);
  }

  removeAll() {
    this.instances.forEach(a => {
      a.remove();
    });
    this.instances = [];
    this.isRemovingAllInstances = true;
  }

  enablePriority() {
    this.isPriorityEnabled = true;
  }
}

export const pool = new Pool();
export const updaterPool = new Pool();
let actorClass: any = Actor;

export function spawn(
  initFunc: (actor: any, ...args: any[]) => void,
  ...args: any[]
) {
  const actor = new actorClass();
  actor.init(initFunc, ...args);
  return actor;
}

export function addUpdater(
  updateFunc: (updater: Updater, actor?: Actor) => void,
  interval = 1
) {
  const updater = new Updater(updateFunc, interval);
  updaterPool.add(updater);
  return updater;
}

export function update() {
  pool.update();
  updaterPool.update();
}

export function reset() {
  pool.removeAll();
  updaterPool.removeAll();
}

export function get(func?: Function) {
  return pool.get(func);
}

export function setActorClass(_actorClass: any) {
  actorClass = _actorClass;
}

function stableSort(values: any[], compareFunc: Function) {
  const indexedValues = values.map((v, i) => [v, i]);
  indexedValues.sort((a, b) => {
    const cmp = compareFunc(a[0], b[0]);
    return cmp !== 0 ? cmp : a[1] - b[1];
  });
  return indexedValues.map(v => v[0]);
}
