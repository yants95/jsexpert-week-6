import { jest, describe, test, expect, beforeEach } from '@jest/globals'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_utils/test-utils.js'

const { pages, location, constants: CONTENT_TYPE } = config

describe('Routes - test suite for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/'

    await handler(...params.values())

    expect(params.response.end).toHaveBeenCalled()
    expect(params.response.writeHead).toHaveBeenNthCalledWith(1, 302, {
      'Location': location.home
    })
  })

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/home'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream
    })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenNthCalledWith(1, pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenNthCalledWith(1, params.response)
  })

  test(`GET /controller - should response with ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/controller'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({ stream: mockFileStream })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
    expect(mockFileStream.pipe).toHaveBeenNthCalledWith(1, params.response)
  })

  test('GET /file.ext - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    const filename = '/file.ext'
    params.request.method = 'GET'
    params.request.url = filename
    const expectedType = '.ext'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    })

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toHaveBeenNthCalledWith(1, filename)
    expect(mockFileStream.pipe).toHaveBeenNthCalledWith(1, params.response)
    expect(params.response.writeHead).not.toHaveBeenCalled()
  })

  test('GET /unknown - given an non-existing route it should response with 404', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/unknown'

    await handler(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  describe('exceptions', () => {
    test('given an non-existing error it should response with 404', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error: ENOENT'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenNthCalledWith(1, 404)
      expect(params.response.end).toHaveBeenCalled()
    })

    test('given an error it should response with 500', async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/index.png'
      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name
      ).mockRejectedValue(new Error('Error'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenNthCalledWith(1, 500)
      expect(params.response.end).toHaveBeenCalled()
    })
  })
})