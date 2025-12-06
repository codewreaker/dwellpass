import { createCollection } from '@tanstack/db'
import { QueryClient } from '@tanstack/query-core'
import {
    queryCollectionOptions
} from '@tanstack/query-db-collection'
import { PatronSchema } from '../schemas'

const queryClient = new QueryClient();

export const usersCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['users'],
        queryFn: async () => {
            return [{
                createdAt: new Date(),
                email: '',
                firstName: '',
                id: '',
                lastName: '',
                updatedAt: new Date(),
                phone: ''
            }]
        },
        getKey: (item) => item.id,
        queryClient,
        onUpdate: async (ctx) => {
            console.log(ctx)
        },
        schema: PatronSchema
    }));
