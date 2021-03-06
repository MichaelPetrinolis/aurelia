import { inject, IRegistry } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.interfaces';
import { IBindScope, IView, IViewFactory, State } from '../../lifecycle';
import { IBindingContext, LifecycleFlags } from '../../observation';
import { Scope } from '../../observation/binding-context';
import { bindable } from '../../templating/bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IRenderLocation)
export class With {
  public static register: IRegistry['register'];

  // TODO: this type is incorrect (it can be any user-provided object), need to fix and double check Scope.
  @bindable public value: IBindScope | IBindingContext;

  private currentView: IView;
  private factory: IViewFactory;

  constructor(factory: IViewFactory, location: IRenderLocation) {
    this.value = null;

    this.factory = factory;
    this.currentView = this.factory.create();
    this.currentView.hold(location, LifecycleFlags.fromCreate);
  }

  public valueChanged(this: With): void {
    if (this.$state & State.isBound) {
      this.bindChild(LifecycleFlags.fromBindableHandler);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.bindChild(flags);
  }

  public attaching(flags: LifecycleFlags): void {
    this.currentView.$attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.currentView.$detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.currentView.$unbind(flags);
  }

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(this.$scope, this.value);
    this.currentView.$bind(flags, scope);
  }
}
