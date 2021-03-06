import { IRegistry, Reporter } from '@aurelia/kernel';
import { Listener } from '../../binding/listener';
import { IEvent, INode } from '../../dom.interfaces';
import { IScope, LifecycleFlags } from '../../observation';
import { findOriginalEventTarget } from '../../observation/event-manager';
import { bindingBehavior } from '../binding-behavior';

/** @internal */
export function handleSelfEvent(this: SelfableBinding, event: IEvent): ReturnType<Listener['callSource']> {
  const target = findOriginalEventTarget(event) as unknown as INode;

  if (this.target !== target) {
    return;
  }

  return this.selfEventCallSource(event);
}

export type SelfableBinding = Listener & {
  selfEventCallSource: Listener['callSource'];
};

@bindingBehavior('self')
export class SelfBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    if (!binding.callSource || !binding.targetEvent) {
      throw Reporter.error(8);
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null;
  }
}
