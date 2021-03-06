import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CartSelectors } from '@ngrx-workshop-app/state/cart';
import { ShippingSelectors } from '@ngrx-workshop-app/state/shipping';
import { CartActions } from '@ngrx-workshop-app/state/cart/actions';

import { CartPageSelectors } from '../state';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  checkoutForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required])
  });

  items$ = this.store.pipe(select(CartSelectors.getAllItemsInCartWithProduct));
  shippingOptions$ = this.store.pipe(
    select(ShippingSelectors.selectAllShippingOptions)
  );
  selectedMethod$ = this.store.pipe(
    select(ShippingSelectors.selectSelectedShippingOption)
  );
  cartSubtotal$ = this.store.pipe(select(CartSelectors.getCartTotal));
  shippingSubtotal$ = this.store.pipe(select(ShippingSelectors.selectShippingCost));
  grandTotal$ = this.store.pipe(select(CartPageSelectors.getTotal));
  shippingInvalid$ = this.store.pipe(select(ShippingSelectors.getShippingInvalid));
  cartInvalid$ = this.store.pipe(select(CartSelectors.getCartInvalid));

  shippingInfoInvalid$ = this.checkoutForm.statusChanges.pipe(
    map(x => x !== 'VALID'),
    startWith(true)
  );

  checkoutDisabled$: Observable<boolean> = combineLatest([
    this.shippingInvalid$,
    this.cartInvalid$,
    this.shippingInfoInvalid$
  ]).pipe(map(arr => arr.some(x => x === true)));

  constructor(private store: Store<{}>) { }

  ngOnInit() {
    this.store.dispatch(CartActions.enterCartPage());
  }

  optionSelected(shippingMethod: string) {
    this.store.dispatch(
      CartActions.cartPageSelectShippingMethod({ shippingMethod })
    );
  }

  onSubmit() {
    this.store.dispatch(CartActions.checkout());
    this.checkoutForm.reset();
  }
}
