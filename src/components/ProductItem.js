import React, { Component } from 'react';
import { stripHtml } from 'string-strip-html';

class ProductItem extends Component {
    constructor(props) {
        super(props);
        this.handleAddToCart = this.handleAddToCart.bind(this);
    }

    handleAddToCart() {
        this.props.onAddToCart(this.props.product.id, 1);
    }

    render() {
        const { product } = this.props;
        const { result } = stripHtml(product.description);

        return (
            <div className="product__card">
                <img className="product__image" src={product.media.source} alt={product.name} />
                <div className="product__info">
                    <h4 className="product__name">{product.name}</h4>
                    <p className="product_description">
                        {result}
                    </p>
                    <div className="product__details">
                        <p className="product__price">
                            {product.price.formatted_with_symbol}
                        </p>
                    </div>
                </div>
                <button 
                name="Add to cart" 
                className="product__btn"   
                onClick={this.handleAddToCart}>
                    Quick Add
                </button> 
            </div>
        );
    }
};

export default ProductItem;