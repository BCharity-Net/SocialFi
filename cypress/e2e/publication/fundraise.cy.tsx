context('Fundraise Page', () => {
  before(() => {
    cy.visit(
      `http://localhost:4783/posts/${
        Cypress.env('is_mainnet') ? '0x24b6-0x03' : '0x3195-0x04'
      }`
    )
  })

  it('should render publication', () => {
    cy.get('[data-test=publication]')
  })

  it('should render fundraise', () => {
    cy.get('[data-test=fundraise]')
  })

  it('should render fundraise meta', () => {
    cy.get('[data-test=fundraise-meta]')
  })

  it('should render fundraise progress bar', () => {
    cy.get('[data-test=fundraise-progress-bar]')
  })
})

export {}
