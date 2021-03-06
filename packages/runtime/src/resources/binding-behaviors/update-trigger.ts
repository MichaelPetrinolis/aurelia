import { inject, IRegistry, Reporter } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { DOM } from '../../dom';
import { IScope, LifecycleFlags } from '../../observation';
import { CheckedObserver, SelectValueObserver, ValueAttributeObserver } from '../../observation/element-observation';
import { EventSubscriber, IEventSubscriber } from '../../observation/event-manager';
import { IObserverLocator } from '../../observation/observer-locator';
import { bindingBehavior } from '../binding-behavior';

export type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
  originalHandler?: IEventSubscriber;
};

export type UpdateTriggerableBinding = Binding & {
  targetObserver: UpdateTriggerableObserver;
};

@bindingBehavior('updateTrigger')
@inject(IObserverLocator)
export class UpdateTriggerBindingBehavior {
  public static register: IRegistry['register'];

  private observerLocator: IObserverLocator;

  constructor(observerLocator: IObserverLocator) {
    this.observerLocator = observerLocator;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void {
    if (events.length === 0) {
      throw Reporter.error(9);
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw Reporter.error(10);
    }

    // ensure the binding's target observer has been set.
    const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty) as UpdateTriggerableObserver;
    if (!targetObserver.handler) {
      throw Reporter.error(10);
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    targetObserver.originalHandler = binding.targetObserver.handler;

    // replace the element subscribe function with one that uses the correct events.
    targetObserver.handler = new EventSubscriber(binding.locator.get(DOM), events);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose();
    binding.targetObserver.handler = binding.targetObserver.originalHandler;
    binding.targetObserver.originalHandler = null;
  }
}
