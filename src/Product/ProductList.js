import React, { Component } from 'react';
import axios from 'axios';
import ProductListItem from "./ProductListItem";

class ProductList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            products : [],
        };

    }

    componentWillMount() {
        axios.get(`http://localhost:5000/res.json`)
            .then(response => {
                    // Sort by name
                    // const products = _.sortBy(response.data, 'name');
                    const products = response.data;
                    // console.log(products);
                    this.setState({ products });
                }
            )
            .catch(function (response) {
                console.log(response);
            });
    }


    render() {
        console.log(this.state.products);
        return (
            <div>
                <table className="table table-sm notopline">
                    <tbody>
                    {this.state.products.map(el =>
                        <ProductListItem product={el} key={el.img}/>
                    )}
                    </tbody>
                </table>
            </div>

        )
    }
}

export default ProductList;