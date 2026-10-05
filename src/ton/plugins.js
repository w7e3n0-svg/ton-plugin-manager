import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';

const TONCENTER_ENDPOINT =
  'https://toncenter.com/api/v2/jsonRPC';

const client = new TonClient({
  endpoint: TONCENTER_ENDPOINT,
});

export function isWalletV4CodeHash(codeHash) {
  return (
    codeHash ===
      '64dd54805522c5be8a9db59cea0105ccf0d08786ca79beb8cb79e880a8d7322d' ||
    codeHash ===
      'feb5ff6820e2ffd0d9483e7e0d62c817d846789fb4ae580c878866d959dab5c0'
  );
}

export async function getWalletInfo(addressString) {
  const address = Address.parse(addressString);

  const [balance, state] = await Promise.all([
    client.getBalance(address),
    client.getContractState(address),
  ]);

  const codeHash = state.code
    ? state.code.hash().toString('hex')
    : null;

  const isV4 = isWalletV4CodeHash(codeHash);

  let version = null;

  if (codeHash ===
      '64dd54805522c5be8a9db59cea0105ccf0d08786ca79beb8cb79e880a8d7322d') {
    version = 'Wallet V4 R1';
  }

  if (codeHash ===
      'feb5ff6820e2ffd0d9483e7e0d62c817d846789fb4ae580c878866d959dab5c0') {
    version = 'Wallet V4 R2';
  }

  return {
    address: address.toString({
      bounceable: true,
      urlSafe: true,
    }),
    balance: balance.toString(),
    state: state.state,
    codeHash,
    isV4,
    version,
  };
}

function parsePluginTuple(tuple) {
  if (!tuple) return null;

  try {
    const first = tuple[0];

    if (
      first &&
      typeof first === 'object' &&
      'items' in first
    ) {
      return parsePluginTuple(first.items);
    }

    if (Array.isArray(tuple) && tuple.length >= 2) {
      const wc = Number(tuple[0].value ?? tuple[0]);
      const hash = tuple[1].value ?? tuple[1];

      return {
        workchain: wc,
        hash: BigInt(hash).toString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function stackToPluginPairs(stack) {
  const result = [];

  if (!stack) {
    return result;
  }

  function walk(value) {
    if (!value) return;

    if (Array.isArray(value)) {
      if (value.length >= 2) {
        const pair = parsePluginTuple(value);

        if (pair) {
          result.push(pair);
          return;
        }
      }

      for (const item of value) {
        walk(item);
      }

      return;
    }

    if (typeof value === 'object') {
      if ('items' in value) {
        walk(value.items);
      }

      if ('value' in value) {
        walk(value.value);
      }

      if ('tuple' in value) {
        walk(value.tuple);
      }
    }
  }

  walk(stack);

  return result;
}

export async function getPluginList(addressString) {
  const address = Address.parse(addressString);

  const result = await client.runMethod(
    address,
    'get_plugin_list',
  );

  const pairs = stackToPluginPairs(result.stack);

  return pairs.map((plugin) => {
    const hash = BigInt(plugin.hash);

    const hashHex = hash
      .toString(16)
      .padStart(64, '0');

    const rawAddress =
      `${plugin.workchain}:${hashHex}`;

    let friendlyAddress = rawAddress;

    try {
      friendlyAddress = Address.parse(
        rawAddress,
      ).toString({
        bounceable: true,
        urlSafe: true,
      });
    } catch {
      // Оставляем raw-адрес,
      // если преобразование не удалось.
    }

    return {
      workchain: plugin.workchain,
      hash: hashHex,
      address: friendlyAddress,
      rawAddress,
    };
  });
}

