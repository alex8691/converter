import React, { Component } from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import debounce from 'lodash.debounce'

const FeesTable = ({ originCurrency, conversionRate, destinationCurrency, total, fee }) => (
    <div>
        <table>
            <tbody>
                <tr>
                    <td>Conversion Rate</td>
                    <td>1 {originCurrency} -> {conversionRate.toFixed(2)} {destinationCurrency}</td>
                </tr>
                <tr>
                    <td>Fee</td>
                    <td>{fee.toFixed(2)} {originCurrency}</td>
                </tr>
                <tr>
                    <td>Total Cost</td>
                    <td>{total.toFixed(2)} {originCurrency}</td>
                </tr>
            </tbody>
        </table>
    </div>
)

FeesTable.propTypes = {
    conversionRate: PropTypes.number.isRequired,
    originCurrency: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    destinationCurrency: PropTypes.string.isRequired
}

class Conversion extends Component {
    state = {
        originAmount: '0.00',
        originCurrency: 'USD',
        destinationAmount: '0.00',
        destinationCurrency: 'EUR',
        feeAmount: 0.00,
        conversionRate: 1.5,
        totalCost: 0.00,
        error: null,
    }

    componentDidMount() {
        this.makeConversion = debounce(this._makeConversion, 350);
        this.makeFeeCalculation = debounce(this._makeFeeCalculation, 350);
    }

    handleCurrencyChange = (current, event) => {
        console.log("current=" +  current)
        if (current === 'origin') {
            this.setState({ originCurrency: event.target.value })
        } else {
            this.setState({ destinationCurrency: event.target.value })
        }
        this.makeConversion({})
        this.makeFeeCalculation({
            originAmount: this.state.originAmount,
            destinationAmount: this.state.destinationAmount,
            destCurrency: this.state.destinationCurrency
        })
    }

    handleOriginAmountChange = (event) => {
        // var that = this;
        var newAmount = event.target.value

        // remove unallowed chars
        newAmount = newAmount.replace(',', '')

        // optimistic field updates
        this.setState({ originAmount: newAmount })
        this.makeConversion({ newValue: newAmount, currentlyEditing: 'origin' })
        this.makeFeeCalculation({
            originAmount: newAmount,
            destinationAmount: this.state.destinationAmount,
            destCurrency: this.state.destinationCurrency
        })
    }

    handleDestAmountChange = (event) => {
        //var that = this;
        var newAmount = event.target.value;

        // remove unallowed chars
        newAmount = newAmount.replace(',', '')
        // optimistic update
        this.setState({ destinationAmount: newAmount })
        this.makeConversion({ newValue: newAmount, currentlyEditing: 'dest' })
        this.makeFeeCalculation({
            originAmount: this.state.originAmount,
            destinationAmount: newAmount,
            destCurrency: this.state.destinationCurrency
        })

    }

    _makeConversion = (data) => {
        var params = {
            originAmount: data.newValue || this.state.originAmount,
            destAmount: data.newValue || this.state.destAmount,
            originCurrency: this.state.originCurrency,
            destCurrency: this.state.destinationCurrency,
            calcOriginAmount: false
        }

        // determine whether we need to calc origin or dest amount
        if (data.currentlyEditing === 'dest') {
            params.calcOriginAmount = true
        }

        fetch("/api/conversion?" + $.param(params), { method: "GET" })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        conversionRate: result.xRate,
                        destinationAmount: result.destAmount,
                        originAmount: result.originAmount
                    })
                },
                (error) => {
                    this.setState({
                        error
                    })
                }
            )

    }

    _makeFeeCalculation = (data) => {
        var params = {
            originAmount: data.newValue || this.state.originAmount,
            originCurrency: this.state.originCurrency,
            destCurrency: this.state.destinationCurrency,
        }

        fetch("/api/fees?" + $.param(params), { method: "GET" })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        feeAmount: result.feeAmount,
                        totalCost: parseFloat(result.feeAmount, 10) + parseFloat(params.originAmount, 10)
                    })
                },
                (error) => {
                    this.setState({
                        error
                    })
                }
            )

    }

    render() {
        return (
            <div>
                <label>Convert</label>&nbsp;
            <input ref="originAmountInput"
                    onChange={this.handleOriginAmountChange}
                    value={this.state.originAmount} />
                <select ref="originCurrency"
                    value={this.state.originCurrency}
                    onChange={(event) => this.handleCurrencyChange('origin', event)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                </select>
                to <input onChange={this.handleDestAmountChange}
                    value={this.state.destinationAmount} />
                <select ref="destCurrency"
                    value={this.state.destinationCurrency}
                    onChange={(event) => this.handleCurrencyChange('dest', event)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                </select>


                <hr />
                <FeesTable
                    originCurrency={this.state.originCurrency}
                    destinationCurrency={this.state.destinationCurrency}
                    conversionRate={this.state.conversionRate}
                    fee={this.state.feeAmount}
                    total={this.state.totalCost}
                />
            </div>
        )
    }
}

export default Conversion
