import { NextRequest, NextResponse } from 'next/server';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ApiError,
  CalldataInput,
  TypedDataInput,
  ApprovalInput,
  DecodedCalldata,
  Language,
} from '@/types';
import { decodeCalldata } from '@/lib/decoder/calldata';
import { decodeTypedData } from '@/lib/decoder/typedData';
import {
  analyzeCalldataRisks,
  analyzePermitRisks,
  analyzeTypedDataRisks,
  analyzeApprovalRisks,
} from '@/lib/analyzer/riskSignals';
import { buildAnalyzeResponse } from '@/lib/analyzer/output';
import { recordRequest } from '@/lib/metrics/store';
import { MAX_UINT256_STRING } from '@/lib/decoder/signatures';
import type { Address, Hex } from 'viem';

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeResponse | ApiError>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    // Validate request
    if (!body.mode || !body.data) {
      return NextResponse.json(
        { error: 'Invalid request', code: 'INVALID_REQUEST', details: 'mode and data are required' },
        { status: 400 }
      );
    }

    const lang: Language = body.lang || 'ja';

    let response: AnalyzeResponse;

    switch (body.mode) {
      case 'calldata': {
        const data = body.data as CalldataInput;
        if (!data.calldata) {
          return NextResponse.json(
            { error: 'Invalid request', code: 'INVALID_REQUEST', details: 'calldata is required' },
            { status: 400 }
          );
        }
        response = await handleCalldataMode(data, lang);
        break;
      }

      case 'typedData': {
        const data = body.data as TypedDataInput;
        if (!data.typedData) {
          return NextResponse.json(
            { error: 'Invalid request', code: 'INVALID_REQUEST', details: 'typedData is required' },
            { status: 400 }
          );
        }
        response = await handleTypedDataMode(data, lang);
        break;
      }

      case 'approval': {
        const data = body.data as ApprovalInput;
        if (!data.token || !data.spender || !data.amount) {
          return NextResponse.json(
            { error: 'Invalid request', code: 'INVALID_REQUEST', details: 'token, spender, and amount are required' },
            { status: 400 }
          );
        }
        response = await handleApprovalMode(data, lang);
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid mode', code: 'INVALID_MODE', details: 'mode must be calldata, typedData, or approval' },
          { status: 400 }
        );
    }

    // Record metrics
    recordRequest(body.mode, lang, response.riskSignals.length);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function handleCalldataMode(
  data: CalldataInput,
  lang: Language
): Promise<AnalyzeResponse> {
  const result = decodeCalldata(data.calldata as Hex, data.to as Address);

  if (!result.success || !result.decoded) {
    // Return response with no decoded details but with unclear intent risk
    const risks = await analyzeCalldataRisks(
      {
        functionName: 'unknown',
        functionSelector: (data.calldata.slice(0, 10) || '0x00000000') as `0x${string}`,
        args: {},
      },
      lang
    );
    return buildAnalyzeResponse(null, risks, lang);
  }

  const risks = await analyzeCalldataRisks(result.decoded, lang);
  return buildAnalyzeResponse(result.decoded, risks, lang);
}

async function handleTypedDataMode(
  data: TypedDataInput,
  lang: Language
): Promise<AnalyzeResponse> {
  const result = decodeTypedData(data.typedData);

  if (!result.success || !result.decoded) {
    return buildAnalyzeResponse(null, [], lang);
  }

  if (result.isPermit && result.permitDetails) {
    const risks = await analyzePermitRisks(result.permitDetails, lang);
    return buildAnalyzeResponse(result.decoded, risks, lang, result.permitDetails);
  }

  const risks = await analyzeTypedDataRisks(result.decoded, lang);
  return buildAnalyzeResponse(result.decoded, risks, lang);
}

async function handleApprovalMode(
  data: ApprovalInput,
  lang: Language
): Promise<AnalyzeResponse> {
  const amount = data.amount === 'unlimited' ? MAX_UINT256_STRING : data.amount;
  const risks = await analyzeApprovalRisks(
    data.token as Address,
    data.spender as Address,
    amount,
    lang
  );

  const decoded: DecodedCalldata = {
    functionName: 'approve',
    functionSelector: '0x095ea7b3',
    args: {
      spender: data.spender,
      amount,
      tokenContract: data.token,
    },
  };

  return buildAnalyzeResponse(decoded, risks, lang);
}
