import React, { Component } from 'react';
import { commerce } from '../lib/commerce';
import PropTypes from 'prop-types';

class Checkout extends Component {
    constructor(props) { 
        super(props);

        this.state = {
            checkoutToken: {},
            // Customer Details
            firstName: '',
            lateName: '',
            email: '',
            // Shipping details
            shippingName: '',
            shippingStreet: '',
            shippingCity: '',
            shippingStateProvince: '',
            shippingPostalZipCode: '',
            shippingCountry: '',
            //Payment Details
            cardNum: '',
            expMonth: '',
            expYear: '',
            ccv: '',
            billingPostalZipcode: '',
            // Shipping and fulfillment data
            shippingCountries: {},
            shippingSubdivisions: {},
            shippingOptions: [],
            shippingOption: '',
        }

        this.handleFormChanges = this.handleFormChanges.bind(this);
        this.handleShippingCountryChange = this.handleShippingCountryChange.bind(this);
        this.handleSubdivisionChange = this.handleSubdivisionChange.bind(this);
        this.handleCaptureCheckout = this.handleCaptureCheckout.bind(this);
    };

    componentDidMount() {
        this.generateCheckoutToken();
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.state.shippingCountry !== prevState.shippingCountry) {
            this.fetchShippingOptions(this.state.checkoutToken.id, this.state.shippingCountry);
        }
    };

    sanitizedLineItems(lineItems) {
        return lineItems.reduce((data, lineItem) => {
            const item = data;
            let variantData = null;
            if(lineItem.selected_options.length) {
                variantData = {
                    [lineItem.selected_options[0].group_id]: lineItem.selected_options[0].option_id,
                };
            }
            item[lineItem.id] = {
                quantity: lineItem.quantity,
                variants: variantData,
            };
            return item;
        }, {});
    }

    /**
     *  Generates a checkout Token
     */

    generateCheckoutToken() {
        const { cart } = this.props;
        if (cart.line_items.length) {
            return commerce.checkout.generateToken(cart.id, { type: 'cart' })
                .then((token) =>this.setState({ checkoutToken: token }))
                .then(() => this.fetchShippingCountries(this.state.checkoutToken.id))
                .catch((error) => {
                    console.log('There was an error in generating a token', error);
                });
        }
    };


    /**
     * Fetches a list of countries available to ship to checkout token
     * @param {string} checkoutTokenId
     */
    fetchShippingCountries(checkoutTokenId) {
        commerce.services.localeListShippingCountries(checkoutTokenId).then((countries) => {
            this.setState({
                shippingCountries: countries.countries,
            })
        }).catch((error) => {
            console.log('There was an error fetching a list of shipping countries', error);
        });
    };

    /**
     * Fetches the state/province for a country
     * @param {string} countryCode
     */
    fetchSupdivisions(countryCode) {
        commerce.services.localeListSubdivisions(countryCode).then((subdivisions) => {
            this.setState({
                shippingSubdivisions: subdivisions.subdivisions,
            }).catch((error) => {
                console.log('There was an error fetching state/province', error);
            })
        });
    };

    /**
     * Fetches available shipping methods
     * @param {string} checkoutTokenId
     * @param {string} country
     * @param {string} stateProvince
     */
     fetchShippingOptions(checkoutTokenId, country, stateProvince = null) {
        commerce.checkout.getShippingOptions(checkoutTokenId,
            {
                country: country,
                region: stateProvince
            }).then((options) => {
                // Pre-select the first available method
                const shippingOption = options[0] || null;
                this.setState({
                    shippingOption: shippingOption,
                    shippingOptions: options
                })
            }).catch((error) => {
                console.log('There was an error fetching the shipping methods', error);
        });
    };

    handleFormChanges(e) {
        this.setState({
          [e.target.name]: e.target.value,
        });
    };

    handleShippingCountryChange(e) {
        const currentValue = e.target.value;
        this.fetchSupdivisions(currentValue);
    };

    handleCaptureCheckout(e) {
        const { cart } = this.props;
        e.preventDefault();
        const orderData = {
            line_items: this.sanitizedLineItems(cart.line_items),
            custome: {
                firstname: this.state.firstName,
                lastname: this.state.lastname,
                email: this.state.email
            },
            shipping: {
                name: this.state.shippingName,
                street: this.state.shippingStreet,
                town_city: this.state.shippingCity,
                county_state: this.state.shippingStateProvince,
                postal_zip_code: this.state.shippingPostalZipCode,
                country: this.state.shippingCountry,
            },
            fulfillment: {
                shipping_method: this.state.shippingOption
            },
            payment: {
                gatway: "test_gatway",
                card: {
                    number: this.state.cardNum,
                    expiry_month: this.state.expMonth,
                    expiry_year: this.state.expiry_year,
                    cvc: this.state.ccv,
                    postal_zip_code: this.state.shippingPostalZipCode
                }
            }
        };
        this.props.onCaptureCheckout(this.state.checkoutToken.id, orderData);
        this.props.history.push('/confirmation');
    };

    renderCheckoutForm() {
        const { shippingCountries, shippingSubdivisions, shippingOptions } = this.state;

        return (
            <form className="checkout__form" onChange={this.handleFormChanges}>
                <h4 className="checkout__subheading">Customer information</h4>

                    <label className="checkout__label" htmlFor="firstName">First name</label>
                    <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.firstName} name="firstName" placeholder="Enter your first name" required />

                    <label className="checkout__label" htmlFor="lastName">Last name</label>
                    <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.lastName}name="lastName" placeholder="Enter your last name" required />

                    <label className="checkout__label" htmlFor="email">Email</label>
                    <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.email} name="email" placeholder="Enter your email" required />

                <h4 className="checkout__subheading">Shipping details</h4>

                <label className="checkout__label" htmlFor="shippingName">Full name</label>
                <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.shippingName} name="shippingName" placeholder="Enter your shipping full name" required />

                <label className="checkout__label" htmlFor="shippingStreet">Street address</label>
                <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.shippingStreet} name="shippingStreet" placeholder="Enter your street address" required />

                <label className="checkout__label" htmlFor="shippingCity">City</label>
                <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.shippingCity} name="shippingCity" placeholder="Enter your city" required />

                <label className="checkout__label" htmlFor="shippingPostalZipCode">Postal/Zip code</label>
                <input className="checkout__input" type="text" onChange={this.handleFormChanges} value={this.state.shippingPostalZipCode} name="shippingPostalZipCode" placeholder="Enter your postal/zip code" required />

                <label className="checkout__label" htmlFor="shippingCountry">Country</label>
                <select
                    value={this.state.shippingCountry}
                    name="shippingCountry"
                    onChange={this.handleShippingCountryChange}
                    className="checkout__select"
                >
                    <option disabled>Country</option>
                    {
                        Object.keys(shippingCountries).map((index) => {
                            return (
                                <option value={index} key={index}>{shippingCountries[index]}</option>
                            );
                        })
                    };
                </select>

                <label className="checkout__label" htmlFor="shippingStateProvince">State/province</label>
                <select
                    value={this.state.shippingStateProvince}
                    name="shippingStateProvince"
                    onChange={this.handleSubdivisionChange}
                    className="checkout__select"
                >
                    <option className="checkout__option" disabled>State/province</option>
                    {
                        Object.keys(shippingSubdivisions).map((index) => {
                            return (
                                <option value={index} key={index}>{shippingSubdivisions[index]}</option>
                            );
                        })
                    };

                </select>

                <label className="checkout__label" htmlFor="shippingOption">Shipping method</label>
                <select
                    value={this.state.shippingOption.id}
                    name="shippingOption"
                    onChange={this.handleFormChanges}
                    className="checkout__select"
                >
                    <option className="checkout__select-option" disabled>Select a shipping method</option>
                    {
                        shippingOptions.map((method, index) => {
                            return (
                                <option className="checkout__select-option" value={method.id} key={index}>{`${method.description} - $${method.price.formatted_with_code}` }</option>
                            );
                        })
                    };
                </select>

                <h4 className="checkout__subheading">Payment information</h4>

                <label className="checkout__label" htmlFor="cardNum">Credit card number</label>
                <input className="checkout__input" type="text" name="cardNum" onChange={this.handleFormChanges} value={this.state.cardNum} placeholder="Enter your card number" />

                <label className="checkout__label" htmlFor="expMonth">Expiry month</label>
                <input className="checkout__input" type="text" name="expMonth" onChange={this.handleFormChanges} value={this.state.expMonth} placeholder="Card expiry month" />

                <label className="checkout__label" htmlFor="expYear">Expiry year</label>
                <input className="checkout__input" type="text" name="expYear" onChange={this.handleFormChanges} value={this.state.expYear} placeholder="Card expiry year" />

                <label className="checkout__label" htmlFor="ccv">CCV</label>
                <input className="checkout__input" type="text" name="ccv" onChange={this.handleFormChanges} value={this.state.ccv} placeholder="CCV (3 digits)" />

                <button onClick={this.handleCaptureCheckout} className="checkout__btn-confirm">Confirm order</button>
            </form>
        );
    };

    renderCheckoutSummary() {
        const { cart } = this.props;

        return(
            <>
                <div className="checkout__summary">
                    <h4>Order summary</h4>
                        {cart.line_items.map((lineItem) => (
                            <>
                                <div key={lineItem.id} className="checkout__summary-details">
                                    <img className="checkout__summary-img" src={lineItem.media.source} alt={lineItem.name}/>
                                    <p className="checkout__summary-name">{lineItem.quantity} x {lineItem.name}</p>
                                    <p className="checkout__summary-value">{lineItem.line_total.formatted_with_symbol}</p>
                                </div>
                            </>
                        ))}
                    <div className="checkout__summary-total">
                        <p className="checkout__summary-price">
                            <span>Subotal: </span>
                            {cart.subtotal.formatted_with_symbol}
                        </p>
                    </div>
                </div>
            </>
        )
    }

    render() {
        return (
            <div className="checkout">
                <h2 className="checkout__heading">Checkout</h2>
                <div className="checkout__wrapp">
                    { this.renderCheckoutForm() }
                    { this.renderCheckoutSummary() }
                </div>
            </div>
        );
    };
};


export default Checkout;