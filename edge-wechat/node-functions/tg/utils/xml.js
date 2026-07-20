import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  suppressEmptyNode: true,
});

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
});

export function toXml(obj) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(obj)}`;
}

export function parseXml(xml) {
  return parser.parse(xml);
}

export function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function s3Error({ code, message, resource, requestId }) {
  return toXml({
    Error: {
      Code: code,
      Message: message,
      Resource: resource || '',
      RequestId: requestId || '',
    },
  });
}

export function s3ListBuckets(buckets, ownerId = 'tgfs') {
  return toXml({
    ListAllMyBucketsResult: {
      '@_xmlns': 'http://s3.amazonaws.com/doc/2006-03-01/',
      Owner: {
        ID: ownerId,
        DisplayName: ownerId,
      },
      Buckets: {
        Bucket: buckets.map((b) => ({
          Name: b.name,
          CreationDate: b.creationDate || new Date().toISOString(),
        })),
      },
    },
  });
}

export function s3ListObjectsV2({
  bucket,
  prefix = '',
  delimiter = '',
  maxKeys = 1000,
  keyCount,
  isTruncated,
  nextContinuationToken,
  contents = [],
  commonPrefixes = [],
}) {
  const result = {
    ListBucketResult: {
      '@_xmlns': 'http://s3.amazonaws.com/doc/2006-03-01/',
      Name: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
      KeyCount: keyCount ?? contents.length + commonPrefixes.length,
      IsTruncated: isTruncated ? 'true' : 'false',
      Contents: contents.map((c) => ({
        Key: c.key,
        LastModified: c.lastModified,
        ETag: `"${c.etag}"`,
        Size: c.size,
        StorageClass: 'STANDARD',
      })),
    },
  };

  if (delimiter) {
    result.ListBucketResult.Delimiter = delimiter;
  }
  if (nextContinuationToken) {
    result.ListBucketResult.NextContinuationToken = nextContinuationToken;
  }
  if (commonPrefixes.length) {
    result.ListBucketResult.CommonPrefixes = commonPrefixes.map((p) => ({
      Prefix: p,
    }));
  }

  return toXml(result);
}

export function s3DeleteResult({ deleted = [], errors = [] }) {
  const body = {
    DeleteResult: {
      '@_xmlns': 'http://s3.amazonaws.com/doc/2006-03-01/',
    },
  };
  if (deleted.length) {
    body.DeleteResult.Deleted = deleted.map((d) => ({ Key: d.key }));
  }
  if (errors.length) {
    body.DeleteResult.Error = errors.map((e) => ({
      Key: e.key,
      Code: e.code,
      Message: e.message,
    }));
  }
  return toXml(body);
}

export function davMultistatus(responses) {
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<d:multistatus xmlns:d="DAV:">',
  ];
  for (const r of responses) {
    lines.push('  <d:response>');
    lines.push(`    <d:href>${escapeXml(r.href)}</d:href>`);
    lines.push('    <d:propstat>');
    lines.push('      <d:prop>');
    if (r.displayname != null) {
      lines.push(`        <d:displayname>${escapeXml(r.displayname)}</d:displayname>`);
    }
    if (r.isCollection) {
      lines.push('        <d:resourcetype><d:collection/></d:resourcetype>');
    } else {
      lines.push('        <d:resourcetype/>');
      if (r.contentLength != null) {
        lines.push(`        <d:getcontentlength>${r.contentLength}</d:getcontentlength>`);
      }
      if (r.contentType) {
        lines.push(`        <d:getcontenttype>${escapeXml(r.contentType)}</d:getcontenttype>`);
      }
      if (r.etag) {
        lines.push(`        <d:getetag>"${escapeXml(r.etag)}"</d:getetag>`);
      }
    }
    if (r.lastModified) {
      lines.push(`        <d:getlastmodified>${escapeXml(r.lastModified)}</d:getlastmodified>`);
    }
    lines.push('      </d:prop>');
    lines.push(`      <d:status>HTTP/1.1 ${r.status || '200 OK'}</d:status>`);
    lines.push('    </d:propstat>');
    lines.push('  </d:response>');
  }
  lines.push('</d:multistatus>');
  return lines.join('\n');
}
