import React, { Component } from 'react';
import { commerce } from './lib/commerce';
import { FontAwesomeIcon } from '@fortawesome/fontawesome-free';
import { Switch, Route } from 'react-router-dom'

import Cart from './components/Cart';
import ProductsList from './components/ProductsList';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      loading: true,
      cart: {},
      isCartVisible: false,
      order: this.loadOrderFromLocalStorage() ?? {},
    }

    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handleEmptyCart = this.handleEmptyCart.bind(this);
    this.handleUpdateCartQty = this.handleUpdateCartQty.bind(this);
    this.toggleCart = this.toggleCart.bind(this);
    this.handleCaptureCheckout = this.handleEmptyCart.bind(this);
    this.refreshCart = this.refreshCart.bind(this);
  }

  componentDidMount() {
    this.fetchProducts();
    this.fetchCart();
    this.fetchCart();
    this.loadOrderFromLocalStorage();
  };

  /**
   * Fetch a saved order receipt from local storage so we can show the confirmation page
   */
  loadOrderFromLocalStorage() {
    if(window.localStorage.getItem('order_receipt')) {
      return JSON.parse(window.localStorage.getItem('order_receipt'));
    }
  }

  fetchCart() {
    commerce.cart.retrieve().then((cart) => {
      this.setState({ cart });
    }).catch((error) => {
      console.error('There was an error fetching the cart', error);
    });
  }

  toggleCart() {
    const { isCartVisible } = this.state;
    this.setState({
      isCartVisible: !isCartVisible,
    });
  };

  /*
    Fetch products data from Chec and store in the products data object.
  */
  fetchProducts() {
    commerce.products.list().then((products) => {
      this.setState({ products: products.data, loading: false });
    }).catch((error) => {
      console.log('There was an error fetching the products', error);
    });
  }


  /**
   * Adds a product to the current cart in session
   * @param {string} productId 
   * @param {number} quantity 
   */
  handleAddToCart(productId, quantity) {
    commerce.cart.add(productId, quantity).then((item) => {
      this.setState({ cart: item.cart });
    }).catch((error) => {
      console.error('There was an error adding the item to the cart', error);
    });
  }


  /**
   * Updates line_items in cart
   * @param {string} lineItemId 
   * @param {number} quantity 
   */
  handleUpdateCartQty(lineItemId, quantity) {
    commerce.cart.update(lineItemId, { quantity }).then((resp) => {
      this.setState({ cart: resp.cart });
    }).catch((error) => {
      console.log('There was an error updating the cart items', error);
    });
  }


  /**
   * Removes line item from cart
   * @param {string} lineItemId 
   */
  handleRemoveFromCart(lineItemId) {
    commerce.cart.remove(lineItemId).then((resp) => {
      this.setState({
        cart: resp.cart
      });
    }).catch((error) => {
      console.log('There was an error removing the item from the cart', error);
    });
  }


  /**
   * Empties cart contents
   */
  handleEmptyCart() {
    commerce.cart.empty().then((resp) => {
      this.setState({
        cart: resp.cart
      });
    }).catch((error) => {
      console.log('There was an error emptying the cart', error);
    });
  }

  handleCaptureCheckout(checkoutTokenId, newOrder) {
    commerce.checkout.capture(checkoutTokenId, newOrder).then((order) => {
      this.setState({
        order: order,
      });
      //Store the order in session storage so we can show it again
      // if the user refreshes the page!
      window.localStorage.setItem('order_receipt', JSON.stringify(order));
      // Clears the cart
      this.refreshCart();
      // Send the user to the receipt
      this.props.history.push('/confirmation');
    }).catch((error) => {
      console.log('There was an error confirming your order', error);
    });
  }

  /**
   * Refreshes to a new cart
   */
  refreshCart() {
    commerce.cart.refresh().then((newCart) => {
      this.setState({
        cart: newCart,
      })
    }).catch((error) => {
      console.log('There was an error refreshing your cart', error);
    });
  }

  renderCartNav() {
    const { cart, isCartVisible } = this.state;

    return (
      <div className="nav">
        <div className="nav__cart" onClick={this.toggleCart}>
          {!isCartVisible} ? (
            <button className="nav__cart">
              <FontAwesomeIcon size="2x" icon="shopping-bag" color="#292B83"/>
              {cart !== null ? <span>{cart.total_items}</span> : ''}
            </button>
          ) : (
            <button className="nav__cart-close">
              <FontAwesomeIcon size="1x" icon="times" color="white"/>
            </button>
          )
        </div>
      </div>
    )
  }

  render() {
    const { products, loading, cart, isCartVisible, order } = this.state;
    
    if(loading) {
      return <p>Loading...</p>
    }

    console.log(this.state.cart);

    return (
      <div className="app">
        <Switch>
          <Route
            path="/"
            exact
            render={(props) => {
              return (
                <>
                  { this.renderCartNav() }
                  {isCartVisible && 
                    <Cart
                      {...this.props}
                      cart={cart}
                      onUpdateCartQty={this.handleUpdateCartQty}
                      onRemoveFromCart={this.handleRemoveFromCart}
                      onEmptyCart={this.handleEmptyCart}
                    />
                  }
                  <ProductsList
                    {...this.props}
                    products={products}
                    onAddToCart={this.handleAddToCart}
                  />
                </>
              );
            }}
          />
          <Route
            path="/checkout"
            exact
            render={(props) => {
              return (
                <Checkout
                  {...this.props}
                  cart={cart}
                  onCaptureCheckout={this.handleCaptureCheckout}
                />
              );
            }}
          />
        </Switch>
      </div>
    );
  }
};

export default App;
