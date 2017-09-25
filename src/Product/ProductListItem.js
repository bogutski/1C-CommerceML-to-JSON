import React, { Component } from 'react';

class ProductListItem extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <tr>
                <td>
                    {this.props.product.img}
                </td>

                <td>
                    {this.props.product.title}
                </td>

                <td>
                    {this.props.product.price}
                </td>
            </tr>
        );
    }
}

export default ProductListItem;