import React, { Component } from 'react';
import { commerce } from './lib/commerce';
import { FontAwesomeIcon } from '@fortawesome/fontawesome-free';

import Cart from './components/Cart';
import ProductsList from './components/ProductsList';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      loading: true,
      cart: {},
      isCartVisible: false,
    }

    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  componentDidMount() {
    this.fetchProducts();
    this.fetchCart();
  };

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

  handleAddToCart(productId, quantity) {
    commerce.cart.add(productId, quantity).then((item) => {
      this.setState({ cart: item.cart });
    }).catch((error) => {
      console.error('There was an error adding the item to the cart', error);
    });
  }

  handleUpdateCartQty(lineItemId, quantity) {
    commerce.cart.update(lineItemId, { quantity }).then((resp) => {
      this.setState({ cart: resp.cart });
    }).catch((error) => {
      console.log('There was an error updating the cart items', error);
    });
  }

  handleRemoveFromCart(lineItemId) {
    commerce.cart.remove(lineItemId).then((resp) => {
      this.setState({
        cart: resp.cart
      });
    }).catch((error) => {
      console.log('There was an error removing the item from the cart', error);
    });
  }

  handleEmptyCart() {
    commerce.cart.empty().then((resp) => {
      this.setState({
        cart: resp.cart
      });
    }).catch((error) => {
      console.log('There was an error emptying the cart', error);
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
    const { products, loading, cart, isCartVisible } = this.state;
    
    if(loading) {
      return <p>Loading...</p>
    }

    console.log(this.state.cart);

    return (
      <div className="app">
        <ProductsList
          products={products}
          onAddToCart={this.handleAddToCart}
        />
        <Cart
        cart={cart}
        />
      </div>
    );
  }
};

export default App;
