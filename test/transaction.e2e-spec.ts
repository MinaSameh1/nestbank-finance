import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { generateFakeUser } from 'src/api/users/tests/user.test.helper'
import { AppModule } from 'src/app.module'
import { ErrorCodes, ErrorMessages } from 'src/assets/strings'
import { Account, User } from 'src/entities'
import * as request from 'supertest'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let user: User
  let account: Account
  let toAccount: Account

  const setUpUserAndAccount = async () => {
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send(generateFakeUser())
    expect(userRes.status).toBe(201)

    user = userRes.body
    expect(user.id).toBeDefined()

    const [accountRes, toAccountRes] = await Promise.all([
      request(app.getHttpServer()).post('/accounts').send({
        userId: user.id,
        active: true,
        type: 'checking',
        balance: 500,
      }),
      request(app.getHttpServer()).post('/accounts').send({
        userId: user.id,
        active: true,
        type: 'savings',
        balance: 500,
      }),
    ])
    expect(accountRes.status).toBe(201)
    account = accountRes.body

    expect(toAccountRes.status).toBe(201)
    toAccount = toAccountRes.body
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    await setUpUserAndAccount()
    return app
  }, 25000)

  it('Should Transfer between accounts', async () => {
    const res = await request(app.getHttpServer()).put(
      `/transactions/transfer/${account.id}/${toAccount.id}/100`,
    )
    expect(res.status).toBe(200)
  }, 10000)

  it('Should deposit to account', async () => {
    const res = await request(app.getHttpServer()).post(
      `/transactions/deposit/${account.id}/100`,
    )
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('amount')
  })

  it('Should withdraw from account', async () => {
    const res = await request(app.getHttpServer()).post(
      `/transactions/withdraw/${account.id}/100`,
    )
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('amount')
  })

  it('Should refund Transaction', async () => {
    const res = await request(app.getHttpServer()).put(
      `/transactions/transfer/${account.id}/${toAccount.id}/100`,
    )
    expect(res.status).toBe(200)
    const transaction = res.body
    const refundRes = await request(app.getHttpServer()).post(
      `/transactions/refund/${transaction.id}`,
    )
    expect(refundRes.status).toBe(200)
    expect(refundRes.body.originalTransaction).toHaveProperty('id')
    expect(refundRes.body.transaction).toHaveProperty('id')
    expect(refundRes.body.transaction.refundable).toBe(false)
  }, 20000)

  it('Should get all transactions', async () => {
    const res = await request(app.getHttpServer()).get(`/transactions`)
    expect(res.status).toBe(200)
    expect(res.body.items).toBeInstanceOf(Array)
    expect(res.body.items.length).toBeGreaterThan(0)
    expect(res.body.items[0]).toHaveProperty('id')
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.pages).toBeGreaterThan(0)
  }, 10000)

  it('Should fail to refund', async () => {
    const res = await request(app.getHttpServer()).post(
      `/transactions/deposit/${account.id}/100`,
    )
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('amount')

    const refundRes = await request(app.getHttpServer()).post(
      `/transactions/refund/${res.body.id}`,
    )

    expect(refundRes.status).toBe(400)
    expect(refundRes.body.message).toEqual(ErrorMessages.REFUND_NOT_ALLOWED)
    expect(refundRes.body.error).toBe(ErrorCodes.REFUND_NOT_ALLOWED)
  }, 10000)
})
