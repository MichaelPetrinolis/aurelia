export class MockBrowserHistoryLocation {
  public changeCallback: Function;

  private states: Object[] = [{}];
  private paths: string[] = [''];
  private index: number = 0;

  get length(): number {
    return this.states.length;
  }
  get state(): Object {
    return this.states[this.index];
  }
  get path(): string {
    return this.paths[this.index];
  }

  get pathname(): string {
    const parts = this.parts;
    parts.shift();
    return <string>parts.shift();
  }
  get search(): string {
    const parts = this.parts;
    if (parts.shift()) {
      parts.shift();
    }
    parts.shift();
    const part: string = <string>parts.shift();
    return part !== undefined ? `?${part}` : '';
  }
  get hash(): string {
    const parts = this.parts;
    if (!parts.shift()) {
      parts.shift();
    }
    parts.shift();
    const part: string = <string>parts.shift();
    return part !== undefined ? `#${part}` : '';
  }
  set hash(value: string) {
    if (value.startsWith('#')) {
      value = value.substr(1);
    }
    const parts = this.parts;
    const hashFirst = parts.shift();
    let path = parts.shift();
    if (hashFirst) {
      parts.shift();
      path += `#${value}`;
      const part = parts.shift();
      if (part !== undefined) {
        path += `?${part}`;
      }
    } else {
      const part = parts.shift();
      if (part !== undefined) {
        path += `?${part}`;
      }
      parts.shift();
      path += `#${value}`;
    }

    this.pushState({}, null, <string>path);
    this.notifyChange();
  }

  // TODO: Fix a better split
  private get parts(): (string | boolean)[] {
    const parts: (string | boolean)[] = this.path.split(/[#?]/);
    let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
    let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
    parts.unshift(hash < search);
    return parts;
  }

  public pushState(data: Object, title: string, path: string) {
    this.states.splice(this.index + 1);
    this.paths.splice(this.index + 1);
    this.states.push(data);
    this.paths.push(path);
    this.index++;
  }

  public replaceState(data: Object, title: string, path: string) {
    this.states[this.index] = data;
    this.paths[this.index] = path;
  }

  public go(movement: number) {
    const newIndex = this.index + movement;
    if (newIndex >= 0 && newIndex < this.states.length) {
      this.index = newIndex;
      this.notifyChange();
    }
  }

  private notifyChange() {
    if (this.changeCallback) {
      console.log('MOCK: notifyChange', this.path, this.state);
      this.changeCallback();
    }
  }
}
