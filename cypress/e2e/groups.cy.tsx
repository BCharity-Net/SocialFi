context('Groups Page', () => {
  before(() => {
    cy.visit('http://localhost:4783/groups')
  })

  it('should render most active groups', () => {
    cy.get('[data-test=most-active-groups]')
  })

  it('should render fastest growing groups', () => {
    cy.get('[data-test=fastest-growing-groups]')
  })

  it('should render latest groups', () => {
    cy.get('[data-test=latest-groups]')
  })
})

export {}
