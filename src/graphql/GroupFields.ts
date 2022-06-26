import { gql } from '@apollo/client'

export const GroupFields = gql`
  fragment GroupFields on Post {
    id
    profile {
      id
    }
    metadata {
      name
      description
      content
      attributes {
        value
      }
      cover {
        original {
          url
        }
      }
    }
    stats {
      totalAmountOfCollects
      totalAmountOfComments
    }
    createdAt
  }
`
