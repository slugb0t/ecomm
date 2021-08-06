import React, { Component } from 'react';
import ProductItem from './ProductItem';


class ProductsList extends Component {
    render() {
        const { products } = this.props;

        return (
            <div className="products">
                {products.map((product) => (
                    <ProductItem
                    key={product.id}
                    product={product}
                    {...this.props}     //spread operator to pass the whole props object
                    />
                ))}
            </div>
        );
    }
}

export default ProductsList;