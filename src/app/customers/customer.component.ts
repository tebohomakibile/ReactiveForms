import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormArray,
} from '@angular/forms';

import { Customer } from './customer';
import { debounceTime } from 'rxjs/operators';

// Initial custom validator function for the rating. The max and min vlaues are hard coded
/*function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if ((c.value !== null && isNaN(c.value)) || c.value < 1 || c.value > 5) {
    return { range: true };
  }

  return null;
}*/

// Factory function that accepts the min and max values as parameters and returs
// a custon validator function.
function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (
      (c.value !== null && isNaN(c.value)) ||
      c.value < min ||
      c.value > max
    ) {
      return { range: true };
    }

    return null;
  };
}

function emailCompare(c: AbstractControl): { [key: string]: boolean } | null {
  const email = c.get('email');
  const confirmedEmail = c.get('confirmEmail');

  if (email.pristine || confirmedEmail.pristine) {
    return null;
  }

  if (email.value !== confirmedEmail.value) {
    return { match: true };
  }
  return null;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent implements OnInit {
  customer = new Customer();
  customerForm: FormGroup;
  emailValidationMessage: string;

  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.',
  };

  get addressGroup(): FormArray {
    return <FormArray>this.customerForm.get('addressGroup');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // this.customerForm = this.fb.group({
    //   firstName: { value: 'Jack', disabled: true },
    // });

    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.max(50)]],
      emailGroup: this.fb.group(
        {
          email: ['', [Validators.required, Validators.email]],
          confirmEmail: ['', Validators.required],
        },
        { validator: emailCompare }
      ),
      sendCatalog: true,
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      addressGroup: this.fb.array([this.builAddress()]),
    });

    this.customerForm.get('notification').valueChanges.subscribe((value) => {
      console.log(value);

      this.setNoficationVia(value);
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.subscribe((value) => {
      console.log(value);

      emailControl.valueChanges.pipe(debounceTime(1000));
    });

    // this.customerForm = new FormGroup({
    //   firstName: new FormControl(),
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sendCatalog: new FormControl(),
    // });
  }

  populateTestValues(): void {
    this.customerForm.setValue({
      firstName: 'Jack',
      lastName: 'Harness',
      email: 'jack@harnesstrading.com',
      sendCatalog: true,
    });
  }

  patchTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Harness',
    });
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setNoficationVia(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');

    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  // setMessage(c: AbstractControl): void {
  //   this.emailValidationMessage = '';

  //   if ((c.touched || c.dirty) && c.errors) {
  //     this.emailValidationMessage = Object.keys(c.errors)
  //       .map((key) => {
  //         this.validationMessages[key];
  //       })
  //       .join(' ');
  //   }
  // }

  setMessage(c: AbstractControl): void {
    this.emailValidationMessage = '';
    if ((c.touched || c.dirty) && c.errors.required) {
      this.emailValidationMessage = this.validationMessages.required;
    }

    if ((c.touched || c.dirty) && c.errors.email) {
      this.emailValidationMessage = this.validationMessages.email;
    }
  }

  builAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zip: '',
    });
  }

  addAddress(): void {
    this.addressGroup.push(this.builAddress());
  }
}
