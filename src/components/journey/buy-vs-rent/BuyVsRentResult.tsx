import { Check, CircleAlert, House, PiggyBank, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fixedRentalOptions } from '../../../data/buyVsRent'
import type { BuyVsRentResult as BuyVsRentResultType, RentalComparison, SwpOutcome } from '../../../types/buyVsRent'
import { formatCurrency, formatDuration } from '../../../utils/formatters'

function SwpCard({ label, description, outcome }: { label: string; description: string; outcome: SwpOutcome }) {
  return (
    <article className="rent-swp-card">
      <span>{label}</span>
      <h4>{formatCurrency(outcome.monthlyWithdrawal)}<small>/month</small></h4>
      <p>{description}</p>
      <div>
        <dl><dt>Starting SWP corpus</dt><dd>{formatCurrency(outcome.startingCorpus)}</dd></dl>
        <dl><dt>Total withdrawn</dt><dd>{formatCurrency(outcome.totalWithdrawn)}</dd></dl>
        <dl><dt>Withdrawal period</dt><dd>{formatDuration(outcome.durationMonths)}</dd></dl>
        <dl><dt>Remaining corpus</dt><dd>{formatCurrency(outcome.remainingCorpus)}</dd></dl>
      </div>
    </article>
  )
}

function RentalDetail({ rental, result }: { rental: RentalComparison; result: BuyVsRentResultType }) {
  return (
    <div className="rent-comparison-detail">
      <div className="rent-comparison-detail__head">
        <div><span>SELECTED RENTAL PATH</span><h3>{formatCurrency(rental.startingRent)} monthly rent</h3></div>
        <p>The rent rises by {result.rentIncrease}% yearly. The amount left from the EMI is invested each month.</p>
      </div>

      <div className="rent-comparison-equation"><span>{formatCurrency(result.monthlyEmi)} EMI</span><i>−</i><span>{formatCurrency(rental.startingRent)} rent</span><i>=</i><strong>{formatCurrency(rental.startingMonthlySip)} starting SIP</strong></div>

      <div className="rent-comparison-detail__metrics">
        <dl><dt>Starting SIP</dt><dd>{formatCurrency(rental.startingMonthlySip)}</dd></dl>
        <dl><dt>SIP tenure</dt><dd>{result.years} years</dd></dl>
        <dl><dt>Assumed SIP return</dt><dd>{result.sipReturn}% / year</dd></dl>
        <dl><dt>SIP corpus</dt><dd>{formatCurrency(rental.sipCorpus)}</dd></dl>
        <dl><dt>Future home target</dt><dd>{formatCurrency(result.futureHomeValue)}</dd></dl>
        <dl><dt>Corpus − home value</dt><dd>{formatCurrency(rental.sipSurplus)}</dd></dl>
      </div>

      <div className="rent-swp-grid">
        <SwpCard
          label="SIP SURPLUS → SWP"
          description={`Uses only the amount left after the SIP corpus covers the future home value. SWP return: ${result.swpReturn}%.`}
          outcome={rental.sipOnlySwp}
        />
        <SwpCard
          label="SIP + LUMP SUM SURPLUS → SWP"
          description={`Adds the invested down-payment corpus before covering the same home target. SWP return: ${result.swpReturn}%.`}
          outcome={rental.combinedSwp}
        />
      </div>
    </div>
  )
}

export function BuyVsRentResult({ result }: { result: BuyVsRentResultType }) {
  const [selectedRent, setSelectedRent] = useState(result.validRentals[0]?.startingRent ?? 0)
  const selected = result.validRentals.find((rental) => rental.startingRent === selectedRent) ?? result.validRentals[0]

  useEffect(() => {
    if (!result.validRentals.some((rental) => rental.startingRent === selectedRent)) {
      setSelectedRent(result.validRentals[0]?.startingRent ?? 0)
    }
  }, [result.validRentals, selectedRent])

  return (
    <section className="buy-rent-result">
      <div className="buy-rent-result__signal">
        <div><WalletCards size={21} /></div>
        <span>NUMORA HOME DECISION</span>
        <strong>BUY THIS HOME <i>VS</i> RENT + INVEST</strong>
      </div>
      <div className="buy-rent-result__intro">
        <div>
          <h2>Understand the home-buying side first.</h2>
          <p>See the loan commitment, future home requirement and what the down payment could become if invested.</p>
        </div>
        <span>BUYING PLAN / {result.years} YEARS</span>
      </div>

      <div className="buy-rent-foundation">
        <article>
          <div className="buy-rent-foundation__icon"><House size={20} /></div>
          <span>HOME LOAN SCENARIO</span>
          <h3>{formatCurrency(result.homePrice)}</h3>
          <div className="buy-rent-foundation__list">
            <dl><dt>Down payment</dt><dd>{formatCurrency(result.downPayment)}</dd></dl>
            <dl><dt>Loan amount</dt><dd>{formatCurrency(result.loanAmount)}</dd></dl>
            <dl><dt>Monthly EMI</dt><dd>{formatCurrency(result.monthlyEmi)}</dd></dl>
            <dl><dt>Loan assumptions</dt><dd>{result.annualRate}% · {result.years} years</dd></dl>
            <dl><dt>Total interest</dt><dd>{formatCurrency(result.totalInterest)}</dd></dl>
          </div>
        </article>

        <article className="buy-rent-foundation__target">
          <div className="buy-rent-foundation__icon"><PiggyBank size={20} /></div>
          <span>FUTURE HOME REQUIREMENT</span>
          <h3>{formatCurrency(result.futureHomeValue)}</h3>
          <div className="buy-rent-foundation__list">
            <dl><dt>Current home value</dt><dd>{formatCurrency(result.homePrice)}</dd></dl>
            <dl><dt>Property appreciation</dt><dd>{result.propertyAppreciation}% / year</dd></dl>
            <dl><dt>Required fixed SIP</dt><dd>{formatCurrency(result.requiredMonthlySip)}</dd></dl>
            <dl><dt>Investment return</dt><dd>{result.sipReturn}% / year</dd></dl>
            <dl><dt>Comparison period</dt><dd>{result.years} years</dd></dl>
          </div>
        </article>

        <article className="buy-rent-foundation__lumpsum">
          <div className="buy-rent-foundation__icon"><WalletCards size={20} /></div>
          <span>DOWN PAYMENT AS LUMP SUM</span>
          <h3>{formatCurrency(result.lumpsumFutureValue)}</h3>
          <div className="buy-rent-foundation__list">
            <dl><dt>Initial investment</dt><dd>{formatCurrency(result.downPayment)}</dd></dl>
            <dl><dt>Estimated return</dt><dd>{result.sipReturn}% / year</dd></dl>
            <dl><dt>Tenure</dt><dd>{result.years} years</dd></dl>
            <dl><dt>Estimated gain</dt><dd>{formatCurrency(result.lumpsumGain)}</dd></dl>
          </div>
        </article>
      </div>

      <div className="rental-paths">
        <div className="rental-paths__head">
          <div><span>VALID RENTAL + SIP OPTIONS</span><h3>Choose a rental path to inspect.</h3></div>
          <p>{result.validRentals.length ? `${result.validRentals.length} of ${fixedRentalOptions.length} rental options reach the future home value. Only those paths are shown.` : `None of the ${fixedRentalOptions.length} fixed rental options reaches the future home value.`}</p>
        </div>
        {selected ? (
          <>
            <div className="rental-paths__switcher" role="tablist" aria-label="Valid rental options">
              {result.validRentals.map((rental) => (
                <button key={rental.startingRent} type="button" role="tab" aria-selected={rental.startingRent === selected.startingRent} className={rental.startingRent === selected.startingRent ? 'is-active' : ''} onClick={() => setSelectedRent(rental.startingRent)}>
                  <span>RENT</span><strong>{formatCurrency(rental.startingRent)}</strong><small>SIP starts at {formatCurrency(rental.startingMonthlySip)}</small><i><Check size={14} /> {formatCurrency(rental.sipSurplus)} surplus</i>
                </button>
              ))}
            </div>
            <RentalDetail rental={selected} result={result} />
          </>
        ) : (
          <div className="rental-paths__empty"><CircleAlert size={24} /><div><strong>No fixed rent option builds the required corpus.</strong><p>A fixed monthly SIP of approximately {formatCurrency(result.requiredMonthlySip)} is required to target {formatCurrency(result.futureHomeValue)} over {result.years} years.</p></div></div>
        )}
      </div>

      <p className="buy-rent-result__note">Educational projection only. Property appreciation, SIP, lump-sum and SWP returns are assumptions—not guaranteed returns. Taxes, fees and purchase costs are not included.</p>
    </section>
  )
}
