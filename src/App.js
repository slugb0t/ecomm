import React, { Component } from 'react';
import { commerce } from './lib/commerce';
import ProductsList from './components/ProductsList';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      loading: true,
      cart: {},
    }
  }

  componentDidMount() {
    this.fetchProducts();
    this.fetchCart();
  };

  fetchCart() {
    commerce.cart.retrieve().then((card) => {
      this.setState({ cart });
    }).catch((error) => {
      console.error('There was an error fetching the cart', error);
    });
  }

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

  render() {
    const { products, loading } = this.state;
    
    if(loading) {
      return <p>Loading...</p>
    }

    console.log(commerce.cart.add);

    return (
      <div className="app">
        <ProductsList
          products={products}
          onAddToCart={this.handleAddToCart}
        />
      </div>
    );
  }
};

export default App;
