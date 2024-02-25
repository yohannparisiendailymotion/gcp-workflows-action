/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'specs':
          return '{"env":"dev","functions":[{"name":"function-1","type":"node","folder":"function_1","runtime":"nodejs20","region":"europe-west1","entry_point":"main","env_name":"GCF_MYWORKFLOW_F1","commit":"be7d0c2"},{"name":"function-2","type":"node","folder":"function_2","runtime":"nodejs20","region":"europe-west2","entry_point":"main","env_name":"GCF_MYWORKFLOW_F2","commit":"be7d0c2"},{"name":"function-3","type":"node","folder":"function_3","runtime":"nodejs20","region":"europe-west3","entry_point":"main","env_name":"GCF_MYWORKFLOW_F3","commit":"be7d0c2"}],"variables":[{"name":"ENV","value":"PROD"}]}'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(errorMock).not.toHaveBeenCalled()
  })
})
